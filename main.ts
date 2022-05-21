/**
 * SIM7020E (NB-IOT) extension for calliope
 * Connecting to ThingSpeak via MQTT 
 *
 * Uses https://github.com/calliope-mini/pxt-calliope-modem
 *  
 * @author Raik Andritschke
 * 
 */

enum SIM7020E_AT_DEBUG {
    //% block="AT_DEBUG_OFF"
    AT_DEBUG_OFF,
    //% block="AT_DEBUG_RETURN"
    AT_DEBUG_RETURN,
    //% block="AT_DEBUG_USB"
    AT_DEBUG_USB
}

//% weight=20 color=#0fbc11 icon="\uf09e"
namespace SIM7020E {
    const THINGSPEAK_MQTT = 'mqtt3.thingspeak.com';
    const THINGSPEAK_MQTT_PORT = 1883;
    const RESPONSE = 'RESPONSE:'
    const ERROR = 'ERROR';
    const OK = 'OK';
    let MODEM_DEBUG = false;
    let AT_DEBUG: SIM7020E_AT_DEBUG = SIM7020E_AT_DEBUG.AT_DEBUG_OFF;
    let TX = 0;
    let RX = 0;
    let RATE = 0;

    function logUSB(prefix: string, message: string): void {
        basic.pause(100);
        serial.resetSerial();
        serial.writeLine(prefix + " " + message);
        while (serial.busy()) basic.pause(10);
        serial.redirect(TX, RX, RATE);
        basic.pause(100);
    }

    /*
    * Init Serial
    */
    //% blockId="initModem" block="Initialisiere Modem TX Pin %tx | RX Pin %rx | Baudrate %rate"
    // tx.defl=SerialPin.
    export function initModem(tx: SerialPin, rx: SerialPin, rate: BaudRate) {
        TX = tx;
        RX = rx;
	RATE = rate;
        modem.init(
            tx,
            rx,
            rate
        )
        modem.setATPrefix("AT")
        serial.setReceiveBufferSize(1000)
    }

    function sendATCommand(command: string): string {
        let response = modem.sendAT(command)
        if (response[response.length - 1] == OK) {
            let return_code = OK
            let contents = ''
            for (let line = 0; line <= response.length - 1; line++) {
                contents = contents + '/' + response[line]
                if (AT_DEBUG == SIM7020E_AT_DEBUG.AT_DEBUG_USB) {
                    logUSB(RESPONSE, response[line])
                }
            }
            if (AT_DEBUG == SIM7020E_AT_DEBUG.AT_DEBUG_RETURN) {
                return_code = contents
            }
            return return_code
        }
        return ERROR
    }

    /*
    * "AT+CBAND" command set mobile operation band
    */
    //% blockId="setMobileOperationBand" block="Setze NB IOT Band %band" 
    //% advanced=true
    export function setMobileOperationBand(band: number): string {
        return sendATCommand('+CBAND=' + band.toString());
    }

    /*
    * "AT+CFUN" command set phone functionality: 0:Minimum, 1:Full
    */
    //% blockId="setPhoneFunctionality" block="Setze Modem Funktion %fun"
    //% advanced=true
    export function setPhoneFunctionality(fun: number): string {
        return sendATCommand('+CFUN=' + fun.toString());
    }

    /*
    * "AT+CREVHEX" command set output data format: 0:RAW, 1:HEX
    */
    //% blockId="setOutputDataFormat" block="Setze Modem Ausgabeformat %format"
    //% advanced=true
    export function setOutputDataFormat(format: number): string {
        return sendATCommand('+CREVHEX=' + format.toString());
    }

    /*
    * "AT*MCGDEFCONT" command set default PSD connection settings
    */
    //% blockId="setDefaultPSDConnectionSettings" block="Setze Default PSD Parameter PDP Type %pdptype | APN %apn | Username %username | Password %password"
    //% advanced=true
    export function setDefaultPSDConnectionSettings(pdptype: string, apn: string, username?: string, password?: string): string {
        if ((pdptype == '') || (apn == '')) return ERROR;
        let command = '"' + pdptype + '"'
        command = command + ',"' + apn + '"'
        if (username) {
            command = command + ',"' + username + '"'
            if (password) {
                command = command + ',"' + password + '"'
            }
        }
        return sendATCommand('*MCGDEFCONT=' + command);
    }

    /*
    * "AT+COPS" command register network
    */
    //% blockId="registerNetwork" block="Registriere GSM Netzwerk Operator Mode %mode | Format %format | Network %network | ACT %act"
    //% advanced=true
    export function registerNetwork(mode: number, format: number, network: string, act?: number): string {
        if ((mode == 0) || (format == 0) || (network == '')) return ERROR;
        let command = mode.toString()
        command = command + ',' + format
        command = command + ',"' + network + '"'
        if (act) {
            command = command + ',' + act
        }
        return sendATCommand('+COPS=' + command);
    }

    /*
    * "AT+GMR" command reports the Revision Identification of Software Release
    */
    //% blockId="getModemSoftwareRevision" block="Ermittle Softwareversion"
    //% advanced=true
    export function getModemSoftwareRevision(): string {
        return sendATCommand('+GMR');
    }

    /*
    * "AT+CIMI" command reports the IMSI (International Mobile Subscriber Identity)
    */
    //% blockId="getIMSI" block="Ermittle IMSI"
    //% advanced=true
    export function getIMSI(): string {
        return sendATCommand('+CIMI');
    }

    /*
    * "AT+GSN" command reports the IMEI (International Mobile Equipment Identifier) number in information 
    * text which permit the user to identify the individual sim7020 device.
    */
    //% blockId="getIMEI" block="Ermittle IMEI"
    //% advanced=true
    export function getIMEI(): string {
        return sendATCommand('+GSN');
    }

    /*
    * "AT+CCID" command shows ICCID data of the device. ICCID is a unique serial number that a SIM card contains.
    */
    //% blockId="getCCID" block="Ermittle ICCID"
    //% advanced=true
    export function getCCID(): string {
        return sendATCommand('+CCID');
    }

    /*
    * "AT+CGCONTRDP" command reports current PDP 
    * parameters such as APN (Access Point Name), local IP address, subnet mask e.t.c
    */
    //% blockId="getCurrentPDP" block="Ermittle aktuellen PDP"
    //% advanced=true
    export function getCurrentPDP(): string {
        return sendATCommand('+CGCONTRDP');
    }

    /*
    * "AT+CGDCONT=?" command reports supported PDP's 
    */
    //% block="getSupportedPDP" block="Ermittle unterstützte PDP"
    //% advanced=true
    export function getSupportedPDP(): string {
        return sendATCommand('+CGDCONT=?');
    }

    /*
    * "AT+CSQ" command returns received signal strength indication RSSI and channel bit error rate BER from the ME.
    */
    //% blockId="getRFSignalQuality" block="Ermittle Signalqualität"
    //% advanced=true
    export function getRFSignalQuality(): string {
        return sendATCommand('+CSQ');
    }

    /*
    * "AT+COPS?" command returns the current mode and the currently selected GSM operator. 
    * If no operator is selected, FRMT and OPER fields are omitted.
    */
    //% blockId="getCurrentOperator" block="Ermittle aktuellen Mode und GSM Operator"
    //% advanced=true
    export function getCurrentOperator(): string {
        return sendATCommand('+COPS?');
    }

    /*
    * "AT+CGACT?" command indicates the state of PDP (Packet Data Protocol) context activation.
    */
    //% blockId="getPDPContext" block="Ermittle aktuellen PDP Kontext"
    //% advanced=true
    export function getPDPContext(): string {
        return sendATCommand('+CGACT?');
    }

    /*
    * "AT+IPCONFIG" command returns the complete PDP Address
    */
    //% blockId="getPDPAddress" block="Ermittle aktuelle PDP Adresse"
    //% advanced=true
    export function getPDPAddress(): string {
        return sendATCommand('+IPCONFIG');
    }

    /*
    * "AT+CMQCON?" command shows all MQTT Connections.
    */
    //% blockId="getMQTTConnections" block="Ermittle MQTT Verbindungen"
    //% advanced=true
    export function getMQTTConnections(): string {
        return sendATCommand('+CMQCON?');
    }

    /*
    * "AT+CMQNEW?" command shows all connected MQTT instances.
    */
    //% blockId="getMQTTInstances" block="Ermittle MQTT Instanzen"
    //% advanced=true
    export function getMQTTInstances(): string {
        return sendATCommand('+CMQNEW?');
    }

    /*
    * "AT+CMQNEW=" command creates new MQTT instance.
    */
    //% blockId="createMQTTInstance" block="Erzeuge neue MQTT Instanz für Server %server | Port %port"
    export function createMQTTInstance(server: string, port: number): string {
        let timeout = 10000
        let bufsize = 1024
        let command = '"' + server + '",' + port + ',' + timeout + ',' + bufsize
        return sendATCommand("+CMQNEW=" + command);
    }

    /*
    * "AT+CMQCON=" command sends MQTT connection packet.
    */
    //% blockId="connectMQTT" block="Verbinde MQTT Instanz über MQTT-Verbindung %mqtt_id | als Client %client_id | mit Username %username | und Passwort %password"
    export function connectMQTT(mqtt_id: number, client_id: string, username: string, password:string): string {
        if (client_id == '') return ERROR;
        let mqtt_version = 3
        let mqtt_keepalive = 60
        let mqtt_cleansession = 1 // MUST 1 for ThingSpeak!
        let mqtt_will_flag = 0
	let mqtt_will_options = ''
        let command = mqtt_id.toString() + ',' + mqtt_version + ',"' + client_id + '",' + mqtt_keepalive + ',' + mqtt_cleansession
        command = command + ',' + mqtt_will_flag + ',"' + username + '","' + password + '"'  
	return sendATCommand('+CMQCON=' + command);
    }

    /*
    * "AT+CMQDISCON=" command disconnects MQTT.
    */
    //% blockId="disconnectMQTT" block="Trenne MQTT Instanz auf MQTT-Verbindung %mqtt_id"
    export function disconnectMQTT(mqtt_id: number): string {
        let command = mqtt_id.toString();
        return sendATCommand('+CMQDISCON=' + command);
    }

    /*
    * "AT+CMQPUB=" command sends MQTT publish packet.
    */
    //% blockId="publishMQTT" block="Publiziere MQTT Daten an Thingspeak über MQTT-Verbindung %mqtt_id | Kanal %channel | Feld 1 %n1 | Feld 2 %n2 | Feld 3 %n3 | Feld 4 %n4 | Feld 5 %n5 | Feld 6 %n6 | Feld 7 %n7 | Feld 8 %n8 | Status %status"
    export function publishMQTT(mqtt_id: number, channel: string, n1: number, n2: number, n3: number, n4: number, n5: number, n6: number, n7: number, n8: number, status: string): string {
        if (channel == "") return ERROR;
        let message = ""
        message = "\"field1=" + n1 + "&"
        message = "" + message + "field2=" + n2 + "&"
        message = "" + message + "field3=" + n3 + "&"
        message = "" + message + "field4=" + n4 + "&"
        message = "" + message + "field5=" + n5 + "&"
        message = "" + message + "field6=" + n6 + "&"
        message = "" + message + "field7=" + n7 + "&"
        message = "" + message + "field8=" + n8 + "&"
        message = "" + message + "status=" + status + "\""
        let messagelen = message.length - 2
        let topic = "\"channels/" + channel + "/publish\""
        let command = "" + topic + ",0,0,0," + messagelen + "," + message
        return sendATCommand('+CMQPUB=' + mqtt_id + ',' + command);
    }

    /*
    * Connect to NB-IOT
    */
    //% blockId="connectNBIOT" block="Verbinde SIM7020e mit Band %band | PDPType %pdptype | APN %apn | Netzwerk %network"
    export function connectNBIOT(band: number, pdptype: string, apn: string, network: string): string {
        let error = 0
        if (getModemSoftwareRevision() == ERROR) {
            error = 1
        }
        if (error == 0) {
            basic.pause(100)
            if (SIM7020E.setMobileOperationBand(band) == ERROR) {
                error = 2
            }
        }
        if (error == 0) {
            basic.pause(100)
            if (setPhoneFunctionality(0) == ERROR) {
                error = 3
            }
        }
        if (error == 0) {
            basic.pause(100)
            if (setDefaultPSDConnectionSettings(pdptype, apn) == ERROR) {
                error = 4
            }
        }
        if (error == 0) {
            basic.pause(100)
            if (setPhoneFunctionality(1) == ERROR) {
                error = 5
            }
        }
        if (error == 0) {
            basic.pause(100)
            if (registerNetwork(1, 2, network) == ERROR) {
                error = 6
            }
        }
        if (error > 0)
            return 'ERROR' + error.toString();
        else
            return OK
    }

    //% blockId="powerOn" block="Schalte SIM7020e ein am Pin %dp"
    export function powerOn(dp: DigitalPin) {
        pins.digitalWritePin(dp, 0)
        basic.pause(800)
        pins.digitalWritePin(dp, 1)
        basic.pause(100)
    }

    //% blockId="powerOff" block="Schalte SIM7020e aus am Pin %dp"
    export function powerOff(dp: DigitalPin) {
        pins.digitalWritePin(dp, 0)
        basic.pause(1000)
        pins.digitalWritePin(dp, 1)
        basic.pause(100)
    }

    //% blockId="enableModemDebug" block="Schalte Modem Debug Modus auf %debug"
    export function enableModemDebug(debug: boolean = false): void {
        MODEM_DEBUG = debug;
        modem.enableDebug(MODEM_DEBUG)
    }

    //% blockId="enableATDebug" block="Schalte Befehls Debug Modus auf %debug"
    export function enableATDebug(debug: SIM7020E_AT_DEBUG): void {
        AT_DEBUG = debug;
    }

}

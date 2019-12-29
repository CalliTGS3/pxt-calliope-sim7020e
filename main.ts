/**
 * Paket für SIM7020E und telekom NB-IOT
 */
enum SIM7020E_AT_DEBUG {
    //% block="AT_DEBUG_OFF"
    AT_DEBUG_OFF,
    //% block="AT_DEBUG_RETURN"
    AT_DEBUG_RETURN,
    //% block="AT_DEBUG_USB"
    AT_DEBUG_USB
}

/**
 * Benutzerdefinierte Blöcke
 */
//% weight=102 color= #1a5276 icon="\uf289"
namespace SIM7020E {
    const RESPONSE = 'RESPONSE:'
    const ERROR = 'ERROR';
    const OK = 'OK';
    let MODEM_DEBUG = false;
    let AT_DEBUG: SIM7020E_AT_DEBUG = SIM7020E_AT_DEBUG.AT_DEBUG_OFF;
    let TX=0;
    let RX=0;

    function logUSB(prefix: string, message: string): void {
        basic.pause(100);
        serial.resetSerial();
        serial.writeLine(prefix + " " + message);
        while (serial.busy()) basic.pause(10);
        serial.redirect(TX, RX, BaudRate.BaudRate9600);
        basic.pause(100);
    }

    /*
    * Init Serial
    */
    //% block
    export function initModem(tx: SerialPin, rx: SerialPin, rate: BaudRate) {
        TX = tx;
        RX = rx;
        modem.init(
            tx,
            rx,
            rate
        )
        modem.setATPrefix("AT")
        serial.setReceiveBufferSize(1000)
    }
    
    /*
    * Connect to NB-IOT
    */
    //% block
    export function connectNBIOT(band: number, pdptype:string, apn:string, network:string): string {
        if (getModemSoftwareRevision() != ERROR) {
            basic.pause(100)
            if (setMobileOperationBand(band) != ERROR) {
                basic.pause(100)
                if (setPhoneFunctionality(0) != ERROR) {
                    basic.pause(100)
                    if (setDefaultPSDConnectionSettings(pdptype, apn) != ERROR) {
                        basic.pause(100)
                        if (setPhoneFunctionality(1) != ERROR) {
                            basic.pause(100)
                            if (registerNetwork(1, 2, network) != ERROR) {
                                return OK;
                            }
                        }
                    }
                }
            }
        }
        return ERROR;
    }

    /*
    * "AT+CBAND" command set mobile operation band
    */
    //% block
    export function setMobileOperationBand(band : number) {
        let command = band.toString;
        let response = modem.sendAT('+CBAND=' +  command)
        if (response[response.length - 1] == OK) {
            let return_code = OK
            if (AT_DEBUG == SIM7020E_AT_DEBUG.AT_DEBUG_RETURN) {
                let return_code = response[response.length - 2]
            }
            if (AT_DEBUG == SIM7020E_AT_DEBUG.AT_DEBUG_USB) {
                logUSB(RESPONSE, response[response.length - 2])
            }
            return return_code
        }
        return ERROR
    }

    /*
    * "AT+CFUN" command set phone functionality
    */
    //% block
    export function setPhoneFunctionality(fun: number) {
        let command = fun;
        let response = modem.sendAT('+CFUN=' + command)
        if (response[response.length - 1] == OK) {
            let return_code = OK
            if (AT_DEBUG == SIM7020E_AT_DEBUG.AT_DEBUG_RETURN) {
                let return_code = response[response.length - 2]
            }
            if (AT_DEBUG == SIM7020E_AT_DEBUG.AT_DEBUG_USB) {
                logUSB(RESPONSE, response[response.length - 2])
            }
            return return_code
        }
        return ERROR
    }

    /*
    * "AT*MCGDEFCONT" command set default PSD connection settings
    */
    //% block
    export function setDefaultPSDConnectionSettings(pdptype: string, apn:string, username?:string, password?:string) {
        let command = '"' + pdptype + '"'
        if (apn) {
            command = command + ',"' + apn + '"'    
            if (username) {
                command = command + ',"' + username + '"'
                if (password) {
                    command = command + ',"' + password + '"'
                }
            }
        }
        let response = modem.sendAT('*MCGDEFCONT=' + command)
        if (response[response.length - 1] == OK) {
            let return_code = OK
            if (AT_DEBUG == SIM7020E_AT_DEBUG.AT_DEBUG_RETURN) {
                let return_code = response[response.length - 2]
            }
            if (AT_DEBUG == SIM7020E_AT_DEBUG.AT_DEBUG_USB) {
                logUSB(RESPONSE, response[response.length - 2])
            }
            return return_code
        }
        return ERROR
    }

    /*
    * "AT+COPS" command register network
    */
    //% block
    export function registerNetwork(mode: number, format: number, network: string) {
        let command = mode.toString()
        if (format) {
            command = command + ',' + format
            if (network) {
                command = command + ',"' + network + '"'
            }
        }
        let response = modem.sendAT('+COPS=' + command)
        if (response[response.length - 1] == OK) {
            let return_code = OK
            if (AT_DEBUG == SIM7020E_AT_DEBUG.AT_DEBUG_RETURN) {
                let return_code = response[response.length - 2]
            }
            if (AT_DEBUG == SIM7020E_AT_DEBUG.AT_DEBUG_USB) {
                logUSB(RESPONSE, response[response.length - 2])
            }
            return return_code
        }
        return ERROR
    }

    /*
    * "AT+GMR" command reports the Revision Identification of Software Release
    */
    //% block
    export function getModemSoftwareRevision() {
        let response = modem.sendAT('+GMR')
        if (response[response.length - 1] == OK) {
            let return_code = OK
            if (AT_DEBUG == SIM7020E_AT_DEBUG.AT_DEBUG_RETURN) {
                let return_code = response[response.length - 2]
            }
            if (AT_DEBUG == SIM7020E_AT_DEBUG.AT_DEBUG_USB) {
                logUSB(RESPONSE, response[response.length - 2])
            }
            return return_code
        }
        return ERROR
    }

    /*
    * "AT+CIMI" command reports the IMSI (International Mobile Subscriber Identity)
    */
    //% block
    export function getIMSI() {
        let response = modem.sendAT('+CIMI')
        if (response[response.length - 1] == OK) {
            let return_code = OK
            if (AT_DEBUG == SIM7020E_AT_DEBUG.AT_DEBUG_RETURN) {
                let return_code = response[response.length - 2]
            }
            if (AT_DEBUG == SIM7020E_AT_DEBUG.AT_DEBUG_USB) {
                logUSB(RESPONSE, response[response.length - 2])
            }
            return return_code
        }
        return ERROR
    }

    /*
    * "AT+GSN" command reports the IMEI (International Mobile Equipment Identifier) number in information 
    * text which permit the user to identify the individual sim7020 device.
    */
    //% block
    export function getIMEI() {
        let response = modem.sendAT('+GSN')
        if (response[response.length - 1] == OK) {
            let return_code = OK
            if (AT_DEBUG == SIM7020E_AT_DEBUG.AT_DEBUG_RETURN) {
                let return_code = response[response.length - 2]
            }
            if (AT_DEBUG == SIM7020E_AT_DEBUG.AT_DEBUG_USB) {
                logUSB(RESPONSE, response[response.length - 2])
            }
            return return_code
        }
        return ERROR
    }

    /*
    * "AT+CCID" command shows ICCID data of the device. ICCID is a unique serial number that a SIM card contains.
    */
    //% block
    export function getCCID() {
        let response = modem.sendAT('+CCID')
        if (response[response.length - 1] == OK) {
            let return_code = OK
            if (AT_DEBUG == SIM7020E_AT_DEBUG.AT_DEBUG_RETURN) {
                let return_code = response[response.length - 2]
            }
            if (AT_DEBUG == SIM7020E_AT_DEBUG.AT_DEBUG_USB) {
                logUSB(RESPONSE, response[response.length - 2])
            }
            return return_code
        }
        return ERROR
    }

    /*
    * "AT+CGCONTRDP" command reports current PDP 
    * parameters such as APN (Access Point Name), local IP address, subnet mask e.t.c
    */
    //% block
    export function getCurrentPDP() {
        let response = modem.sendAT('+CGCONTRDP')
        if (response[response.length - 1] == OK) {
            let return_code = OK
            if (AT_DEBUG == SIM7020E_AT_DEBUG.AT_DEBUG_RETURN) {
                let return_code = response[response.length - 2]
            }
            if (AT_DEBUG == SIM7020E_AT_DEBUG.AT_DEBUG_USB) {
                logUSB(RESPONSE, response[response.length - 2])
            }
            return return_code
        }
        return ERROR
    }

    /*
    * "AT+CSQ" command returns received signal strength indication RSSI and channel bit error rate BER from the ME.
    */
    //% block
    export function getRFSignalQuality() {
        let response = modem.sendAT('+CSQ')
        if (response[response.length - 1] == OK) {
            let return_code = OK
            if (AT_DEBUG == SIM7020E_AT_DEBUG.AT_DEBUG_RETURN) {
                let return_code = response[response.length - 2]
            }
            if (AT_DEBUG == SIM7020E_AT_DEBUG.AT_DEBUG_USB) {
                logUSB(RESPONSE, response[response.length - 2])
            }
            return return_code
        }
        return ERROR
    }

    /*
    * "AT+COPS?" command returns the current mode and the currently selected GSM operator. 
    * If no operator is selected, FRMT and OPER fields are omitted.
    */
    //% block
    export function getCurrentOperator() {
        let response = modem.sendAT('+COPS?')
        if (response[response.length - 1] == OK) {
            let return_code = OK
            if (AT_DEBUG == SIM7020E_AT_DEBUG.AT_DEBUG_RETURN) {
                let return_code = response[response.length - 2]
            }
            if (AT_DEBUG == SIM7020E_AT_DEBUG.AT_DEBUG_USB) {
                logUSB(RESPONSE, response[response.length - 2])
            }
            return return_code
        }
        return ERROR
    }

    /*
    * "AT+CGACT?" command indicates the state of PDP (Packet Data Protocol) context activation.
    */
    //% block
    export function getPDPContext() {
        let response = modem.sendAT('+CGACT?')
        if (response[response.length - 1] == OK) {
            let return_code = OK
            if (AT_DEBUG == SIM7020E_AT_DEBUG.AT_DEBUG_RETURN) {
                let return_code = response[response.length - 2]
            }
            if (AT_DEBUG == SIM7020E_AT_DEBUG.AT_DEBUG_USB) {
                logUSB(RESPONSE, response[response.length - 2])
            }
            return return_code
        }
        return ERROR
    }

    /*
    * "AT+IPCONFIG" command returns the complete PDP Address
    */
    //% block
    export function getPDPAddress() {
        let response = modem.sendAT('+IPCONFIG')
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
                let return_code = contents
            }
            return return_code
        }
        return ERROR
    }

    /*
    * "AT+CMQCON?" command shows all MQTT Connections.
    */
    //% block
    export function getMQTTConnections() {
        let response = modem.sendAT('+CMQCON?')
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
                let return_code = contents
            }
            return return_code
        }
        return ERROR
    }

    /*
    * "AT+CMQNEW?" command shows all connected MQTT instances.
    */
    //% block
    export function getMQTTInstances() {
        let response = modem.sendAT('+CMQNEW?')
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
                let return_code = contents
            }
            return return_code
        }
        return ERROR
    }

    /*
    * "AT+CMQNEW=" command creates new MQTT instance.
    */
    //% block
    export function createMQTTInstance(server: string, port: number) {
        let timeout = 10000
        let bufsize = 1024
        let command = '"' + server + '",' + port + ',' + timeout + ',' + bufsize
        let response = modem.sendAT("+CMQNEW=" + command)
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
                let return_code = contents
            }
            return return_code
        }
        return ERROR
    }

    /*
    * "AT+CMQCON=" command sends MQTT connection packet.
    */
    //% block
    export function connectMQTT(mqtt_id: number, client_id: string) {
        let mqtt_version = 3
        let mqtt_keepalive = 60
        let mqtt_cleansession = 1 // MUST 1 for ThingSpeak!
        let mqtt_will_flag = 0
        let command = mqtt_id + ',' + mqtt_version + ',"' + client_id + '",' + mqtt_keepalive + ',' + mqtt_cleansession + ',' + mqtt_will_flag
        let response = modem.sendAT('+CMQCON=' + command)
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
                let return_code = contents
            }
            return return_code
        }
        return ERROR
    }

    /*
    * "AT+CMQDISCON=" command disconnects MQTT.
    */
    //% block
    export function disconnectMQTT(mqtt_id: number) {
        let command = mqtt_id
        let response = modem.sendAT('+CMQDISCON=' + command)
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
                let return_code = contents
            }
            return return_code
        }
        return ERROR
    }

    /*
    * "AT+CMQPUB=" command sends MQTT publish packet.
    */
    //% block
    export function publishMQTT(mqtt_id: number, channel: string, write_api_key: string, n1: number, n2: number, n3: number, n4: number, n5: number, n6: number, n7: number, n8: number, status: string) {
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
        let topic = "\"channels/" + channel + "/publish/" + write_api_key + "\""
        let command = "" + topic + ",0,0,0," + messagelen + "," + message
        let response = modem.sendAT('+CMQPUB=' + mqtt_id + ',' + command)
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
                let return_code = contents
            }
            return return_code
        }
        return ERROR
    }

    //% block
    export function enableModemDebug(debug: boolean = false): void {
        MODEM_DEBUG = debug;
        modem.enableDebug(MODEM_DEBUG)
    }

    //% block
    export function enableATDebug(debug: SIM7020E_AT_DEBUG): void {
        AT_DEBUG = debug;
    }

}

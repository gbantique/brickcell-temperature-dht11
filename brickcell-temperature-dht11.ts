enum dataType {
    //% block="temperature"
    temperature,
    //% block="humidity"
    humidity,
}

//% color="#FFBF00" icon="\uf12e" weight=70
namespace Brickcell {

    let _temperature: number = -999.0
    let _humidity: number = -999.0

    /**
    * Read DHT sensor on %dataPin
    */
    //% block="Read DHT11 $data on pin $dataPin"
    //% blockId=brickcell_temperature_dht11_read_dht
    //% subcategory="temperature dht11"
    export function readDHT(data: dataType, dataPin: DigitalPin): number {

        //initialize
        let checksum: number = 0
        let checksumTmp: number = 0
        let dataArray: boolean[] = []
        let resultArray: number[] = []

        for (let index = 0; index < 40; index++) dataArray.push(false)
        for (let index = 0; index < 5; index++) resultArray.push(0)

        _humidity = -999.0
        _temperature = -999.0

        //request data
        pins.digitalWritePin(dataPin, 0) //begin protocol, pull down pin
        basic.pause(18)

        pins.setPull(dataPin, PinPullMode.PullUp)
        pins.digitalReadPin(dataPin) //pull up pin
        control.waitMicros(40)

        if (pins.digitalReadPin(dataPin) == 0) {

            while (pins.digitalReadPin(dataPin) == 0); //sensor response
            while (pins.digitalReadPin(dataPin) == 1); //sensor response

            //read data (5 bytes)
            for (let index = 0; index < 40; index++) {
                while (pins.digitalReadPin(dataPin) == 1);
                while (pins.digitalReadPin(dataPin) == 0);
                control.waitMicros(28)
                //if sensor still pull up data pin after 28 us it means 1, otherwise 0
                if (pins.digitalReadPin(dataPin) == 1) dataArray[index] = true
            }

            //convert byte number array to integer
            for (let index = 0; index < 5; index++)
                for (let index2 = 0; index2 < 8; index2++)
                    if (dataArray[8 * index + index2]) resultArray[index] += 2 ** (7 - index2)

            //verify checksum
            checksumTmp = resultArray[0] + resultArray[1] + resultArray[2] + resultArray[3]
            checksum = resultArray[4]
            if (checksumTmp >= 512) checksumTmp -= 512
            if (checksumTmp >= 256) checksumTmp -= 256

            if (checksum == checksumTmp) {
                //DHT11
                _humidity = resultArray[0] + resultArray[1] / 100
                _temperature = resultArray[2] + resultArray[3] / 100
            }
        }

        //wait 2 sec after query if needed
        return dataType.humidity ? _humidity : _temperature
    }
}
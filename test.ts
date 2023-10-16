serial.setBaudRate(BaudRate.BaudRate115200)
basic.forever(function () {
    serial.writeLine("" + (Brickcell.readDHT(dataType.temperature, DigitalPin.P0)))
    basic.pause(2000)
})

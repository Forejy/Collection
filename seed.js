const express = require('express');
const https = require("https")
const fs = require("fs")

const url = "https://images.pokemontcg.io/sm9/1_hires.png"

module.exports = () => {
  https.get(url, (res) => {
    console.log("Start")
    const path = "poke1.png"
    const writeStream = fs.createWriteStream(path)

    writeStream.on('error', (err) => {
      console.log(err)
    })

    res.pipe(writeStream)

    writeStream.on("finish", () => {
      writeStream.close()
      console.log("Download Completed")
    })
  })
}

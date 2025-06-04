const nodemailer = require("nodemailer");
const config = require("./config.json").mail;

const transporter = nodemailer.createTransport({
    service: config.service,
    auth: config.auth,
});

module.exports = { transporter };
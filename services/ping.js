const ping = (req,res) => res.status(200).json({ping: "Successful", name: "Erik"});

module.exports = {
    ping
}
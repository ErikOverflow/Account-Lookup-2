const config = require('../config');
const axios = require('axios');
const getDb = require('../dbs/riot_mongoClient');

const axiosOptions = {
    headers: {
        "X-Riot-Token": process.env.RIOTKEY
    }
}

const getRankedDetail = async (region, summonerId) => {
    const db = await getDb();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const query = {
        name: summonerId,
        region: new RegExp(`^${region}$`, 'i'),
        lastModified: { $gte: yesterday}
    }
    const findOptions = { projection: { _id: 0}};
    let rankedDoc;
    try{
        rankedDoc = await db.collection('ranked').findOne(query, findOptions);
    } catch(err) {
        throw err;
    }

    if(rankedDoc){
        return rankedDoc;
    }

    delete query.lastModified;
    let res;
    try{
        res = await axios.get(config.rankedDetailsUrl(region, summonerId), axiosOptions);
    } catch(err) {
        throw err;
    }

    let rankedData = {
        summonerId,
        region,
        rankedDetail: res.data
    }

    const docUpdate = {
        $set: rankedData,
        $currentDate: {lastModified: true}
    };
    const updateOptions = {upsert: true};
    try{
        await db.collection('ranked').updateOne(query, docUpdate, updateOptions);
        rankedDoc = await db.collection('ranked').findOne(query, findOptions);
    } catch(err){
        throw err;
    }
    return rankedDoc
}

const rankedParser = async (req,res,next) => {
    if(!req.summoner.id || !req.query.region){
        return res.status(403).json({error: "Missing summoner Id or region"});
    }
    req.summoner.ranked = await getRankedDetail(req.query.region, req.summoner.id);
    return next();
}

module.exports = {
    rankedParser
}
const TermsAndConditions = require('../models/termsandconditionsModel');
const User = require ('../models/userModel');

const tscsReg = async (req, res) => {
    try {
        const { title, content, version } = req.body;
        let terms = await TermsAndConditions.findOne({ version });

        if (!terms || terms.version !== version) {
            // Create new terms and conditions or update if version is different
            terms = await TermsAndConditions.create({ title, content, version });
            return res.status(201).json({ message: 'Terms and conditions created successfully' });
        }else if (terms.title === title && terms.content === content && terms.version === version) {
            // Terms and conditions are identical, no need to update
            return res.status(200).json({ message: 'Terms and conditions already up to date' });
        }else {
            // Update existing terms and conditions
            terms.title = title;
            terms.content = content;
            await terms.save();

            return res.status(200).json({ message: 'Terms and conditions updated successfully' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to update terms and conditions' });
    }
};

const tscsGet = async (req, res) => {
    try {
        const { version } = req.query
        let terms
        if(!version){
            terms = await TermsAndConditions.find();
        }else{
            terms = await TermsAndConditions.findOne({ version });
        }
        
        if (!terms || terms.length == 0) {
            res.status(404).json({ error: 'Terms and conditions not found' });
            return;
        }
        res.status(200).json(terms);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch terms and conditions' });
    }
};

const getLatestTcs = async (req, res) => {
    try {
        const terms = await TermsAndConditions.find().sort({ updated_at: -1 }).limit(1)
        
        if (!terms || terms.length == 0) {
            res.status(404).json({ error: 'Terms and conditions not found' });
            return;
        }
        res.status(200).json(terms);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch terms and conditions' });
    }
};

const falsyAllUserTsCsStatus = async(req, res) => {
    try{
        await User.updateMany({}, { $set: { tcs: false } });
        res.json({ message: "All users' tcs status updated successfully to false" });        
    }catch(err){
        res.status(500).json({ error: "Failed to update Users' tcs property" });
    }
}

const truthyUserTsCsStatus = async(req, res) => {
    try{
        const { email } = req.body
        const usr = await User.findOne({ email })
        await usr.updateOne({ tcs: true})
        res.status(200).json({message: `User ${usr.userName} has successfully accepted terms and conditions`})
    }catch(err){
        res.status(500).json({ error: "Failed to update User's tcs property" });
    }
}

module.exports = {
    tscsReg,
    tscsGet,
    falsyAllUserTsCsStatus,
    truthyUserTsCsStatus,
    getLatestTcs
}
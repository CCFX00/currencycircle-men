const TermsAndConditions = require('../models/termsandconditionsModel');
const User = require ('../models/userModel');

const tscsRegister = async (req, res) => {
    try {
        const tcs = new TermsAndConditions(req.body);
        await tcs.save();
        res.json({ message: 'tcs registered successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to register tcs' });
    }
};

const tscsUpdate = async (req, res) => {
    try {
        const { title, content, version } = req.body;
        const terms = await TermsAndConditions.findOne();

        // Check if the terms and conditions have been updated
        if (terms && (terms.title !== title || terms.content !== content || terms.version !== version)) {
            // Save the new terms and conditions
            terms.title = title;
            terms.content = content;
            terms.version = version;
            await terms.save();

            // Notify all users to confirm the updated terms and conditions
            await UserModel.updateMany({}, { $set: { confirmedTermsAndConditions: false } });
            return res.json({ message: 'Terms and conditions updated. All users must confirm the updated terms and conditions.' });
        } else if (!terms) {
            // Create new terms and conditions
            await TermsAndConditions.create({ title, content, version });
            return res.json({ message: 'Terms and conditions updated successfully' });
        } else {
            // No changes to the terms and conditions
            return res.json({ message: 'Terms and conditions are up-to-date' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to update terms and conditions' });
    }
};

const tscsGet = async (req, res) => {
    try {
        const terms = await TermsAndConditions.findOne();
        if (!terms) {
            res.status(404).json({ error: 'Terms and conditions not found' });
            return;
        }
        res.json(terms);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch terms and conditions' });
    }
};

module.exports = {
    tscsRegister,
    tscsUpdate,
    tscsGet
}
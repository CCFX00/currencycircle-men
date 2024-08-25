const matchedOfferStatus = require('../models/matchedOfferStatusModel')

// Check offer status logged in user and offer owner using Mongoose aggregation
// exports.checkOfferStatus = async (offer, userId) => {
//     try {
//         const result = await matchedOfferStatus.aggregate([
//             {
//                 $match: {
//                     $or: [
//                         {
//                             // Check if the logged-in user has not declined the offer
//                             $and: [
//                                 { userId: userId.toString() },
//                                 { matchedOfferId: offer._id.toString() },
//                                 { matchedUserId: offer.user.toString() },
//                                 { $or: [ { isAccepted: true }, { isAccepted: { $exists: false } } ] }
//                             ]
//                         },
//                         {
//                             // Check if the offer owner has not declined the offer
//                             $and: [
//                                 { userId: offer.user.toString() },
//                                 { matchedOfferId: offer._id.toString() },
//                                 { matchedUserId: userId.toString() },
//                                 { $or: [ { isAccepted: true }, { isAccepted: { $exists: false } } ] }
//                             ]
//                         }
//                     ]
//                 }
//             }
//         ]);

//         // If the result has any documents, it means neither party has declined the offer
//         return result.length > 0 ? offer : null;
//     } catch (error) {
//         console.error(`Error matching offers: ${error.message}`);
//         return null;
//     }
// }

// Double check for both logged in user and offer owner using findOne()
// exports.checkOfferStatus = async (offer, userId) => {
//     // Check if the offer has been declined or accepted by either the logged-in user or the offer owner
//     const loggedInUserStatus = await matchedOfferStatus.findOne({
//         userId: userId,
//         matchedOfferId: offer._id,
//         matchedUserId: offer.user
//     })

//     const offerOwnerStatus = await matchedOfferStatus.findOne({
//         userId: offer.user,
//         matchedOfferId: offer._id,
//         matchedUserId: userId
//     })

//     // Return the offer only if neither the logged-in user nor the offer owner has declined it
//     if ((!loggedInUserStatus || loggedInUserStatus.isAccepted === true || loggedInUserStatus.isAccepted == null) &&
//         (!offerOwnerStatus || offerOwnerStatus.isAccepted === true || offerOwnerStatus.isAccepted == null)) {

//         // console.log(offer)   
//         return offer
//     } else {
//         return null
//     }
// }

exports.checkOfferStatus = async (offer, userId) => {
    // Check the status of the offer for the logged-in user
    const loggedInUserStatus = await matchedOfferStatus.findOne({
        userId: userId,
        matchedOfferId: offer._id,
        matchedUserId: offer.user
    });

    // Check the status of the offer for the offer owner
    const offerOwnerStatus = await matchedOfferStatus.findOne({
        userId: offer.user,
        matchedOfferId: offer._id,
        matchedUserId: userId
    });

    // Handle different conditions for the offer visibility
    if (loggedInUserStatus && loggedInUserStatus.isAccepted === true) {
        // The offer is accepted by the logged-in user, return it for the logged-in user or the offer owner
        return offer;
    }

    if (offerOwnerStatus && offerOwnerStatus.isAccepted === true) {
        // The offer is accepted by the offer owner, return it for the logged-in user or the offer owner
        return offer;
    }

    if (loggedInUserStatus && loggedInUserStatus.isAccepted === false) {
        // The offer is declined by the logged-in user, do not return it for the logged-in user or the offer owner
        return null;
    }

    if (offerOwnerStatus && offerOwnerStatus.isAccepted === false) {
        // The offer is declined by the offer owner, do not return it for the logged-in user or the offer owner
        return null;
    }

    // If `isAccepted` is `null`, or there is no status, return the offer
    return offer;
};



// Single check for logged in user
// exports.checkOfferStatus = async (offer, userId) => {
//     // Check if the offer has been declined or accepted by the current user
//     const status = await matchedOfferStatus.findOne({
//         userId: userId,
//         matchedOfferId: offer._id
//     })

//     // Return the offer only if isAccepted is true or not set (undefined or null)
//     return (!status || status.isAccepted === true || status.isAccepted == null) ? offer : null;
// }

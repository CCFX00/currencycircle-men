const profanityList = new Set([
    'fuck', 'f*ck', 'f***',
    'shit', 'sh*t', 's***',
    'damn', 'd***',
    'ass', 'a**',
    'bitch', 'b****',
    'crap', 'c***',
    'hell', 'h***',
    'piss', 'p****',
    'motherfucker', 'm***********',
    'dickhead', 'd***head',
    'fucking', 'f***ing',
    'wanker', 'w****r',
    'twat', 't**t',
    'shithead', 's***head',
    'bastard', 'b******'
])

exports.checkProfanity = async (message) => {
    // Split message into words and convert to lowercase
    const wordsInMessage = message.toLowerCase().split(/\s+/)

    // Filter words to check for profanity, removing punctuation
    const foundProfanityList = wordsInMessage.filter((word) => {
        const cleanedWord = word.replace(/[^\w\s]|_/g, '')
        return profanityList.has(cleanedWord)
    })

    return foundProfanityList
}

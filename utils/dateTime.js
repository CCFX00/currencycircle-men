const formatDate = function({ createdAt, updatedAt }){
    const createdAtString = createdAt || updatedAt
    const creationDate = new Date(createdAtString)

    const day = creationDate.getDate()
    const monthIndex = creationDate.getMonth()
    const monthAbbreviations = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]
    const month = monthAbbreviations[monthIndex]
    const year = creationDate.getFullYear()

    return `${day} ${month}, ${year}`
}

const genDateTime = function(){
    // Get current date and time
    const now = new Date();
    const date = now.toLocaleDateString(); // Format: e.g., '10/16/2024'
    const time = now.toLocaleTimeString(); // Format: e.g., '4:30:00 PM'

    return { date, time }
}

module.exports = {
    formatDate,
    genDateTime
}

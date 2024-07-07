const formatDate = function({ createdAt }){
    const createdAtString = createdAt
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

module.exports = {
    formatDate
}

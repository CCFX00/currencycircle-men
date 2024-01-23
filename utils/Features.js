class Features {
    constructor(query, queryStr){
        this.query = query
        this.queryStr = queryStr
    }

    search(){
        const keyword = this.queryStr.keyword ? {
            name:{
                $regex: this.queryStr.keyword,
                $options: 'i'
            }
        }
        :{
            
        }
        this.query = this.query.find({...keyword})
        return this
    }

    filter(){
        const queryCopy = {...this.queryStr}

        // removing some fields
        const removingFields = ['keyword', 'page', 'limit']
        removingFields.forEach((key) => delete queryCopy[key])

        this.query = this.query.find(queryCopy)
        return this
    }
}

module.exports = Features
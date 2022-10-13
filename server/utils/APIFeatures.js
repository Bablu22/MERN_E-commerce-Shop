class APIFeatures {
  constructor(query, queryStr) {
    (this.query = query), (this.queryStr = queryStr);
  }

  search() {
    const keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: this.queryStr.keyword,
            $options: "i",
          },
        }
      : {};

    this.query = this.query.find({ ...keyword });

    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };
    const removeFeilds = ["keyword", "limit", "page"];
    removeFeilds.forEach((el) => delete queryCopy[el]);

    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  pagination(restPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = restPerPage * (currentPage - 1);
    this.query = this.query.limit(restPerPage).skip(skip);
    return this;
  }
}

module.exports = APIFeatures;

module.exports = (mongoose) => {
  return {
    File: mongoose.model('File', {
      name: String,
      url: String,
      ext: String,
    }),
    Movie: mongoose.model('Movie', {
      name: String,
      file: String,
      category: String,
      description: String,
    }),
  }
}
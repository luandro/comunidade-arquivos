const express = require('express')
const fileUpload = require('express-fileupload')
const cors = require('cors')
const slugify = require('@sindresorhus/slugify')
const uuid = require('uuid/v4')
const app = express()
const ssb = require('ssb-client')
const ssbKeys = require('ssb-keys')
// Mongo
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true})
const { File, Movie } = require('./models')(mongoose)
// SSB
// const keys = ssbKeys.loadOrCreateSync('~/.ssb/secret')
// console.log('KERYS', keys.id)
// const ssbOptions = {
//   host: 'localhost', // optional, defaults to localhost
//   port: 8008,        // optional, defaults to 8008
//   key: keys.id,      // optional, defaults to keys.id
//   manifest: require('./manifest.json'),
//   caps: {
//     // random string for `appKey` in secret-handshake
//     shs: 'random'
//   },
// }
// Express
const port = 3005
app.use(cors())
app.use(fileUpload())
app.use(express.static(__dirname + '/data'))
app.get('/', (req, res) => {
  ssb(keys, ssbOptions, (err, sbot) => {
    if (err || !sbot) {
      console.log('ERROR', err)
      res.send(err.toString())
    } else {
      const key = sbot.whoami()
      res.send(key)
    }
  })
  // res.send('Hello World!')
})

app.get('/movies', (req, res) => {
  console.log(req.params)
  Movie.find({}, (err, data) => {
    console.log(data)
    res.json(data)
  })
})

app.get('/files', (req, res) => {
  File.find({}).lean().exec((err, data) => {
    console.log(data)
    res.json(data)
  })
})

app.get('/file', (req, res) => {
  File.find({ _id: req.query.id}, (err, data) => {
    res.json(data[0])
  })
})
 
app.post('/upload', (req, res) => {
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.')
  }

  console.log('FILES', req.files)
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let file = req.files.file
  let fileNames = file.name.split('.')
  const fileExt = fileNames.splice(-1)
  const fileName = fileNames.join('.')
  const slug = `${slugify(fileName)}.${fileExt}`
  console.log(slug)
  // Use the mv() method to place the file somewhere on your server
  const url = `./data/${slug}`
  const serverUrl = `http://localhost:3005/${slug}`
  file.mv(url, (err) => {
    if (err)
      return res.status(500).send(err)
      const data = {
        name: slug,
        url: serverUrl,
        ext: fileExt,
      }
      const file = new File(data)
      file.save().then((i) => {
        res.json(i)
      })
      // ssb((err, sbot) => {
      //   if (err)
      //     throw err
        
      //   sbot.publish({
      //     type: 'flix',
      //     url: serverUrl,
      //   }, (err, msg) => {
      //     // 'msg' includes the hash-id and headers
      //     console.log('RES SSB', msg)
      //     res.json({
      //       id: 1,
      //       url: serverUrl,
      //     })
      //   })
      //   // sbot is now ready. when done:
      //   sbot.close()
      // })
  })
})


app.listen(port, () => console.log(`Example app listening on port ${port}!`))

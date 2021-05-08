const express = require('express')
const path = require('path')
const cors = require('cors')
var multer = require('multer');
const app = express()
var upload = multer({ dest: 'upload/' });
let COS = require('cos-nodejs-sdk-v5');
const { request } = require('http');
const mrequest = require('request')
var mongoose = require('mongoose')
var url = "mongodb://ads:lyzl666@81.70.40.250:27019/ads";
mongoose.connect(url,{ useNewUrlParser: true,useUnifiedTopology: true})
let Ads = mongoose.model('ads',new mongoose.Schema({
    data:{
        type:Array,
        require:true
    },
    id:{
        type:String,
        default:'1'
    }
}))

var cos = new COS({
    SecretId: 'AKIDtwjFYsgtwjC6l9hidYCAj4Z4KLM88kDP',
    SecretKey: 'we9VijofJ5cwHOadfShrnRsKbeSHvKSO'
});
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/cdn', express.static(path.join(__dirname, 'upload/')))
app.get('/', (req, res) => {
    Ads.find({id:'1'},function(err,data){
        res.send(data.data||[])
    })
})

app.post('/update', (req, res) => {
    if (req.body.data) {
        //能正确解析 json 格式的post参数
        Ads.update({id:'1'},{data:req.body.data},function(err,data){
            res.send(data)
        })
    }
})
app.post('/upload', upload.any(), function (req, res, next) {
    // console.log(req.files[0]);  // 上传的文件信息
    cos.putObject({
        Bucket: 'cdn-1253947161', /* 必须 */
        Region: 'ap-guangzhou',    /* 必须 */
        Key: req.files[0].originalname,              /* 必须 */
        StorageClass: 'STANDARD',
        Body: fs.createReadStream(req.files[0].path) , // 上传文件对象
        onProgress: function (progressData) {
            console.log(JSON.stringify(progressData));
            res.end(JSON.stringify(progressData))
        }
    }, function (err, data) {
        console.log(err || data);
        res.end(JSON.stringify(data))
    });
});

// Routes
app.get('/404', (req, res) => {
  res.status(404).send('Not found')
})

app.get('/500', (req, res) => {
  res.status(500).send('Server Error')
})

// Error handler
app.use(function(err, req, res, next) {
  console.error(err)
  res.status(500).send('Internal Serverless Error')
})

app.listen(8080)

module.exports = app

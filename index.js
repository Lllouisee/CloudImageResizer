const AWS = require('aws-sdk');
const sharp = require('sharp');

const S3 = new AWS.S3();

exports.handler = async (event) => {
    try {
        // 獲取上傳的對象信息
        const bucketName = event.Records[0].s3.bucket.name;
        const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

        // 排除已處理的圖片
        if (key.startsWith('resized/')) {
            console.log('Image already processed:', key);
            return;
        }

        // 从 S3 獲取原始圖片
        const originalImage = await S3.getObject({
            Bucket: bucketName,
            Key: key
        }).promise();

        // 使用 sharp 處理圖片
        const resizedImage = await sharp(originalImage.Body)
            .resize(200, 200) // 調整尺寸為 200x200 像素
            .toBuffer();

        // 將處理後的圖片上傳到 S3
        const newKey = `resized/${key}`;
        await S3.putObject({
            Bucket: bucketName,
            Key: newKey,
            Body: resizedImage,
            ContentType: 'image/jpeg' // 根據圖片類型調整
        }).promise();

        console.log('Image resized and saved to', newKey);
    } catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
};



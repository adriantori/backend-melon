const HttpError = require('../models/http-error');
var fs = require('fs')

const datasetGen = async (req, res, next) => {
    var text = "";

    try{
        for (let temp = 0; temp < 3; temp++) {
            for (let phtype = 0; phtype <3; phtype++){  
                for (let nitrogen = 0; nitrogen <3; nitrogen++){
                    for (let fosfor = 0; fosfor <3; fosfor++){
                        for (let kalium = 0; kalium <3; kalium++){
                            for (let humidity = 0; humidity <3; humidity++){
                                //generate temp
                                if (temp==0){
                                    text += '{"temperature":"cold",';
                                }if (temp==1){
                                    text += '{"temperature":"normal",';
                                }if (temp==2){
                                    text += '{"temperature":"hot",';
                                }

                                //generate pH
                                if (phtype==0){
                                    text += '"phType":"acid",';
                                }if (phtype==1){
                                    text += '"phType":"neutral",';
                                }if (phtype==2){
                                    text += '"phType":"base",';
                                }

                                //generate nitrogen
                                if (nitrogen==0){
                                    text += '"nitrogen":"high",';
                                }if (nitrogen==1){
                                    text += '"nitrogen":"normal",';
                                }if (nitrogen==2){
                                    text += '"nitrogen":"low",';
                                }
                                
                                //generate fosfor
                                if (fosfor==0){
                                    text += '"fosfor":"high",';
                                }if (fosfor==1){
                                    text += '"fosfor":"normal",';
                                }if (fosfor==2){
                                    text += '"fosfor":"low",';
                                }

                                //generate kalium
                                if (kalium==0){
                                    text += '"kalium":"high",';
                                }if (kalium==1){
                                    text += '"kalium":"normal",';
                                }if (kalium==2){
                                    text += '"kalium":"low",';
                                }

                                //generate humidity
                                if (humidity==0){
                                    text += '"humidity":"high",';
                                }if (humidity==1){
                                    text += '"humidity":"normal",';
                                }if (humidity==2){
                                    text += '"humidity":"low",';
                                }

                                //conclusion
                                text+= '"conclusion":"';
                                if (temp==0){
                                    text += 'temperatur terlalu tinggi, mohon sesuaikan suhu ruangan. ';
                                }if (temp==2){
                                    text += 'temperatur terlalu tinggi, mohon sesuaikan suhu ruangan. ';
                                }if (phtype==0){
                                    text += 'pH terlalu asam, mohon sesuaikan tingkat keasaman tanah. ';
                                }if (phtype==2){
                                    text += 'pH terlalu basa, mohon sesuaikan tingkat keasaman tanah. ';
                                }if (nitrogen==0){
                                    text += 'tingkat nitrogen terlalu tinggi, kurangi pupuk N. ';
                                }if (nitrogen==2){
                                    text += 'tingkat nitrogen terlalu rendah", tambahkan pupuk N. ';
                                }if (fosfor==0){
                                    text += 'tingkat fosfor terlalu tinggi, kurangi pupuk P. ';
                                }if (fosfor==2){
                                    text += 'tingkat fosfor terlalu rendah, tambahkan pupuk P. ';
                                }if (kalium==0){
                                    text += 'tingkat kalium terlalu tinggi, kurangi pupuk K. ';
                                }if (kalium==2){
                                    text += 'tingkat kalium terlalu rendah, tambahkan pupuk K. ';
                                }if (humidity==0){
                                    text += 'tingkat humiditas terlalu tinggi. ';
                                }if (humidity==2){
                                    text += 'tingkat humiditas terlalu rendah. ';
                                }if (temp==1 && phtype==1 && nitrogen==1 && fosfor==1 && kalium==1 && humidity==1){
                                    text += 'tanaman sudah optimal. ';
                                }
                                
                                text+= '"},\n';
                            }
                        }
                    }
                }
            }
        }
        fs.appendFile('dataset.txt', text, function (err) {
            if (err) {
                const error = new HttpError('generate text error', 500);
                return next(error);
            } else {
              console.log("success!");
            }
          })
    }catch(err){
        const error = new HttpError('generate text error', 500);
        return next(error);
    }
};
exports.datasetGen = datasetGen;
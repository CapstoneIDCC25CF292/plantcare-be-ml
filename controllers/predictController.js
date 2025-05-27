const predictRepository = require("../repositories/historyRepository");
const tf = require("@tensorflow/tfjs");
const sharp = require("sharp");
const getModel = require("../utils/loadModel");

const diseases = {
  bacterial_spot: {
    name: "Bacterial Spot",
    meaning:
      "Bacterial spot adalah penyakit yang disebabkan oleh bakteri Xanthomonas spp. dan menyerang tanaman seperti tomat dan paprika. Penyakit ini menimbulkan bercak kecil berwarna coklat kehitaman pada daun, batang, dan buah. Bercak biasanya dikelilingi oleh lingkaran kuning, dan dapat menyebabkan daun gugur serta kualitas buah menurun.",
    suggestion: [
      "Gunakan benih yang bersertifikat bebas patogen.",
      "Hindari penyiraman dari atas untuk mencegah cipratan air yang menyebarkan bakteri.",
      "Buang dan musnahkan bagian tanaman yang terinfeksi berat.",
      "Lakukan rotasi tanaman untuk mencegah penumpukan patogen di tanah.",
      "Gunakan bakterisida berbahan aktif tembaga jika diperlukan, tetapi dengan pertimbangan resistensi.",
    ],
  },
  black_rot: {
    name: "Black Rot",
    meaning:
      "Black rot adalah penyakit yang terutama menyerang tanaman anggur dan disebabkan oleh jamur Guignardia bidwellii. Gejalanya berupa bercak coklat tua atau hitam pada daun yang berbentuk bulat dengan tepi berwarna lebih cerah. Pada buah, infeksi menyebabkan kerutan, pengerutan, dan akhirnya mengering seperti kismis.",
    suggestion: [
      "Bersihkan kebun dari sisa tanaman yang terinfeksi pada akhir musim tanam.",
      "Pangkas ranting atau daun yang menunjukkan gejala awal.",
      "Gunakan varietas tahan penyakit bila tersedia.",
      "Semprotkan fungisida preventif saat musim hujan atau saat daun mulai tumbuh.",
      "Terapkan jarak tanam yang cukup untuk meningkatkan sirkulasi udara.",
    ],
  },
  citrus_greening: {
    name: "Citrus Greening",
    meaning:
      "Citrus greening, juga dikenal sebagai Huanglongbing (HLB), adalah penyakit bakteri mematikan pada tanaman jeruk yang disebarkan oleh serangga psyllid Asia. Gejalanya termasuk daun menguning tidak merata, buah kecil dan asimetris, serta pohon yang secara keseluruhan menjadi merana. Buah juga terasa pahit dan tidak matang dengan benar.",
    suggestion: [
      "Gunakan bibit jeruk yang bersertifikat bebas dari citrus greening.",
      "Pantau dan kendalikan populasi psyllid dengan perangkap dan insektisida selektif.",
      "Buang dan bakar pohon yang menunjukkan gejala parah.",
      "Terapkan sistem sanitasi ketat pada kebun jeruk.",
      "Gunakan penghalang serangga seperti jaring atau rumah plastik.",
    ],
  },
  common_rust: {
    name: "Common Rust",
    meaning:
      "Common rust adalah penyakit pada jagung yang disebabkan oleh jamur Puccinia sorghi. Gejala awal berupa bintil kecil berwarna coklat kemerahan (pustula) di permukaan atas dan bawah daun. Jika dibiarkan, bisa menurunkan kemampuan fotosintesis daun dan berakibat pada hasil panen.",
    suggestion: [
      "Gunakan varietas jagung yang tahan terhadap penyakit karat.",
      "Tanam di lokasi yang memiliki sirkulasi udara baik.",
      "Pantau tanaman secara rutin, khususnya selama musim lembab.",
      "Gunakan fungisida sistemik jika gejala menyebar luas.",
      "Rotasi tanaman dengan bukan keluarga jagung untuk memutus siklus hidup patogen.",
    ],
  },
  early_blight: {
    name: "Early Blight",
    meaning:
      "Early blight adalah penyakit jamur yang menyerang tomat dan kentang, disebabkan oleh Alternaria solani. Ditandai dengan bercak melingkar berwarna coklat tua pada daun, seringkali dengan pola cincin seperti target. Bisa menyebabkan defoliasi, gangguan pertumbuhan buah, dan menurunkan hasil panen secara signifikan.",
    suggestion: [
      "Tanam varietas tahan terhadap Alternaria.",
      "Gunakan mulsa untuk menghindari cipratan tanah ke daun bagian bawah.",
      "Semprotkan fungisida secara terjadwal, terutama saat cuaca lembap.",
      "Hindari penyiraman dari atas.",
      "Buang dan musnahkan daun atau tanaman yang sudah terinfeksi.",
    ],
  },
  healthy: {
    name: "Healthy",
    meaning:
      "Tanaman dalam kondisi sehat berarti bebas dari infeksi patogen, serangan hama, dan gangguan fisiologis. Daun berwarna hijau merata, pertumbuhan normal, dan tidak menunjukkan gejala bercak, layu, atau perubahan warna yang tidak wajar.",
    suggestion: [
      "Lanjutkan praktik pemeliharaan tanaman seperti penyiraman tepat waktu dan pemupukan seimbang.",
      "Lakukan monitoring rutin terhadap gejala penyakit atau hama.",
      "Pastikan sirkulasi udara dan cahaya matahari cukup.",
      "Jangan menanam terlalu rapat agar kelembaban tidak terlalu tinggi.",
      "Sterilkan alat-alat pertanian secara berkala.",
    ],
  },
  leaf_curl_virus: {
    name: "Leaf Curl Virus",
    meaning:
      "Leaf curl virus adalah infeksi virus yang umumnya menyerang tanaman tomat dan cabai. Virus ini menyebabkan daun menggulung ke atas atau ke bawah, mengecil, menebal, dan pertumbuhan tanaman menjadi kerdil. Penularan utamanya berasal dari kutu putih (whiteflies).",
    suggestion: [
      "Gunakan varietas yang tahan terhadap leaf curl virus.",
      "Kontrol kutu putih dengan insektisida berbahan aktif imidacloprid atau neem oil.",
      "Gunakan perangkap lengket kuning untuk monitoring dan pengendalian.",
      "Buang tanaman yang terinfeksi berat sejak dini.",
      "Hindari penanaman berulang di lokasi yang sama tanpa perlakuan lahan.",
    ],
  },
  powdery_mildew: {
    name: "Powder Mildew",
    meaning:
      "Powdery mildew adalah penyakit jamur yang menyebabkan munculnya lapisan putih seperti bedak pada permukaan daun, batang, dan bunga. Umumnya menyerang saat kelembaban tinggi tetapi cuaca kering. Penyakit ini menghambat fotosintesis dan menyebabkan pertumbuhan tanaman terganggu.",
    suggestion: [
      "Jaga jarak tanam agar sirkulasi udara optimal.",
      "Semprotkan fungisida organik seperti sulfur atau bikarbonat secara preventif.",
      "Pilih varietas tanaman yang tahan penyakit.",
      "Singkirkan bagian tanaman yang terinfeksi untuk mencegah penyebaran.",
      "Kurangi kelembaban di sekitar tanaman (hindari overwatering).",
    ],
  },
  scab: {
    name: "Scab",
    meaning:
      "Scab adalah penyakit jamur (terutama pada apel dan pir) yang ditandai dengan bercak gelap, kasar, dan terkadang pecah-pecah pada daun dan permukaan buah. Penyakit ini mengurangi kualitas estetika dan nilai jual buah secara drastis.",
    suggestion: [
      "Gunakan varietas yang tahan scab.",
      "Buang daun dan buah jatuh yang terinfeksi dari sekitar pohon.",
      "Gunakan fungisida secara terjadwal, terutama saat awal pembentukan daun dan buah.",
      "Pangkas pohon secara berkala agar sinar matahari bisa menembus ke dalam tajuk.",
      "Hindari penyiraman daun pada malam hari.",
    ],
  },
  spider_mites: {
    name: "Spider Mites",
    meaning:
      "Spider mites (tungau laba-laba) adalah hama mikroskopik yang menyerang bagian bawah daun dan mengisap cairan sel tanaman. Gejalanya berupa bintik kuning kecil, jaring halus, dan daun yang mengering serta rontok. Serangan berat bisa menghambat pertumbuhan dan merusak total tanaman.",
    suggestion: [
      "Semprotkan air secara teratur di bagian bawah daun untuk mengganggu aktivitas tungau.",
      "Gunakan minyak neem, sabun insektisida, atau acaricide khusus tungau.",
      "Introduksi predator alami seperti tungau Phytoseiulus persimilis.",
      "Kurangi stres tanaman dengan penyiraman dan pemupukan tepat.",
      "Isolasi tanaman terinfeksi untuk mencegah penyebaran.",
    ],
  },
};

const class_name = [
  "bacterial_spot",
  "black_rot",
  "citrus_greening",
  "early_blight",
  "healthy",
  "leaf_curl_virus",
  "powdery_mildew",
  "scab",
  "spider_mites",
];

exports.predictImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No image uploaded.");

    const imageBuffer = req.file.buffer;

    const image = await sharp(imageBuffer).resize(224, 224).raw().toBuffer();

    const imgArray = new Uint8Array(image);

    if (imgArray.length !== 224 * 224 * 3) {
      return res.status(400).send("Image size is not correct.");
    }

    let imgTensor = tf.tensor4d(Array.from(imgArray), [1, 224, 224, 3]);
    imgTensor = imgTensor.div(tf.scalar(255));

    const model = await getModel();
    const prediction = model.predict(imgTensor);
    const result = await prediction.data();

    const maxIndex = result.indexOf(Math.max(...result));

    const predictionData = {
      prediction: Array.from(result),
      maxIndex,
      class_name: class_name[maxIndex],
      confidence: (result[maxIndex] * 100).toFixed(2),
      next_info: diseases[class_name[maxIndex]],
    };

    const userId = req.user ? req.user.id : null;
    const savedData = await predictRepository.savePrediction(
      userId,
      predictionData,
      imageBuffer
    );

    // res.json({
    //   message: "Successfully predict plants",
    //   data: { id: savedData.id },
    // });

    res.json({
      message: "Successfully predict plants",
      data: predictionData,
      imgTensor: imgTensor
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error during prediction.", err);
  }
};

exports.getPredictionDetail = async (req, res) => {
  try {
    const id = req.params.id;

    const result = await predictRepository.getPredictionDetailById(id);

    if (!result) {
      return res.status(404).json({ message: "Prediction not found" });
    }

    res.status(200).json({ data: result });
  } catch (error) {
    console.error("Error fetching prediction detail:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const history = await predictRepository.getAllHistoryByUser(userId);

    res.status(200).json({ data: history });
  } catch (error) {
    console.error("Error fetching prediction history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

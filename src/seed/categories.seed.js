import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Category from '../models/Category.js';
import Question from '../models/Question.js';

dotenv.config();

const CATEGORIES = [
  {
    key: 'cinema',
    name: { en: 'Cinema & TV', ar: 'سينما و تلفزة' },
    tagline: { en: 'شوفلي حل and the shows everyone quotes', ar: 'شوفلي حل و المسلسلات لي الكل يحكي فيها' },
    color: '#C8262A'
  },
  {
    key: 'geo',
    name: { en: 'Geography & Landmarks', ar: 'جغرافيا و معالم' },
    tagline: { en: 'From Sidi Bou Said to the Sahara', ar: 'من سيدي بوسعيد للصحراء' },
    color: '#1BA8B0'
  },
  {
    key: 'food',
    name: { en: 'Food & Cooking', ar: 'أكل و طبخ' },
    tagline: { en: 'Couscous, brik, and the spice cabinet', ar: 'كسكسي، بريك، و خزانة البهارات' },
    color: '#E8A93B'
  },
  {
    key: 'sport',
    name: { en: 'Sport', ar: 'رياضة' },
    tagline: { en: 'Football rivalries and national pride', ar: 'ديربيات الكورة و الفخر الوطني' },
    color: '#3B7DD8'
  },
  {
    key: 'proverbs',
    name: { en: 'Proverbs & Slang', ar: 'أمثال و سلاڨ' },
    tagline: { en: 'The sayings your grandmother never explained', ar: 'الكلمات لي جدتك عمرها ما فسرتهملك' },
    color: '#7A5CC7'
  }
];

const RAW_QUESTIONS = [
  // ---- Cinema & TV ----------------------------------------------------
  {
    categoryKey: 'cinema',
    text: { en: 'What year did the beloved Tunisian sitcom "Choufli Hal" (شوفلي حل) first air?', ar: 'في أي سنة تعرض لأول مرة مسلسل "شوفلي حل"؟' },
    options: [
      { en: '2005', ar: '2005' },
      { en: '1998', ar: '1998' },
      { en: '2010', ar: '2010' },
      { en: '2000', ar: '2000' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'cinema',
    text: { en: 'What genre is "Choufli Hal"?', ar: 'شنوة نوع مسلسل "شوفلي حل"؟' },
    options: [
      { en: 'Family sitcom', ar: 'كوميديا عائلية' },
      { en: 'Historical drama', ar: 'دراما تاريخية' },
      { en: 'Crime thriller', ar: 'إثارة بوليسية' },
      { en: 'Musical', ar: 'استعراضي غنائي' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'cinema',
    text: { en: 'Which Tunisian director made "Les Silences du Palais" (1994), a landmark of Tunisian cinema?', ar: 'شكون المخرجة التونسية لي عملت فيلم "صمت القصور" سنة 1994؟' },
    options: [
      { en: 'Moufida Tlatli', ar: 'مفيدة التلاتلي' },
      { en: 'Nouri Bouzid', ar: 'النوري بوزيد' },
      { en: 'Férid Boughedir', ar: 'فريد بوغدير' },
      { en: 'Nacer Khemir', ar: 'ناصر خمير' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'cinema',
    text: { en: 'Tunis hosts one of the oldest film festivals in Africa and the Arab world — what is it called?', ar: 'تونس فيها من أقدم المهرجانات السينمائية في إفريقيا و العالم العربي، شنوة إسمو؟' },
    options: [
      { en: 'Journées Cinématographiques de Carthage (JCC)', ar: 'أيام قرطاج السينمائية' },
      { en: 'Cannes Film Festival', ar: 'مهرجان كان' },
      { en: 'Venice Film Festival', ar: 'مهرجان فينيسيا' },
      { en: 'Sundance Film Festival', ar: 'مهرجان صندانس' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'cinema',
    text: { en: 'Most Tunisian sitcoms and dramas are performed in which language?', ar: 'أغلب المسلسلات التونسية تتصور بأي لغة؟' },
    options: [
      { en: 'Tunisian Arabic (Derja)', ar: 'الدارجة التونسية' },
      { en: 'Standard Arabic (Fusha) only', ar: 'الفصحى بس' },
      { en: 'French only', ar: 'الفرنسية بس' },
      { en: 'Berber', ar: 'الأمازيغية' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'cinema',
    text: { en: 'How many seasons did "Choufli Hal" run for, from 2005 to 2009?', ar: 'قداش موسم دام مسلسل "شوفلي حل" من 2005 ل 2009؟' },
    options: [
      { en: '6', ar: '6' },
      { en: '3', ar: '3' },
      { en: '10', ar: '10' },
      { en: '4', ar: '4' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'cinema',
    text: { en: '"Choufli Hal" originally aired on which Tunisian public TV channel?', ar: 'مسلسل "شوفلي حل" تعرض أول مرة في أي قناة؟' },
    options: [
      { en: 'Watania 1 (Al Watania)', ar: 'الوطنية 1' },
      { en: 'Hannibal TV', ar: 'حنبعل تيفي' },
      { en: 'Nessma TV', ar: 'نسمة تيفي' },
      { en: 'El Hiwar Ettounsi', ar: 'الحوار التونسي' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'cinema',
    text: { en: 'The Arabic word "مسلسل" refers to what kind of show?', ar: 'كلمة "مسلسل" تعني شنوة؟' },
    options: [
      { en: 'A TV series', ar: 'سلسلة حلقات تلفزية' },
      { en: 'A single movie', ar: 'فيلم واحد' },
      { en: 'A news bulletin', ar: 'نشرة أخبار' },
      { en: 'A live concert', ar: 'حفل مباشر' }
    ],
    correctIndex: 0
  },

  // ---- Geography & Landmarks -------------------------------------------
  {
    categoryKey: 'geo',
    text: { en: 'What is the capital of Tunisia?', ar: 'شنوة عاصمة تونس؟' },
    options: [
      { en: 'Tunis', ar: 'تونس' },
      { en: 'Sfax', ar: 'صفاقس' },
      { en: 'Sousse', ar: 'سوسة' },
      { en: 'Bizerte', ar: 'بنزرت' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'geo',
    text: { en: 'Sidi Bou Said is famous for its distinctive color scheme — which colors?', ar: 'سيدي بوسعيد مشهورة بألوانها، شنية هي؟' },
    options: [
      { en: 'Blue and white', ar: 'أزرق و أبيض' },
      { en: 'Red and white', ar: 'أحمر و أبيض' },
      { en: 'Green and gold', ar: 'أخضر و ذهبي' },
      { en: 'Black and gold', ar: 'أكحل و ذهبي' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'geo',
    text: { en: 'The ancient ruins of Carthage, near Tunis, were originally founded by which civilization?', ar: 'أطلال قرطاج قرب تونس العاصمة أسستها أي حضارة؟' },
    options: [
      { en: 'The Phoenicians', ar: 'الفينيقيون' },
      { en: 'The Romans', ar: 'الرومان' },
      { en: 'The Ottomans', ar: 'العثمانيون' },
      { en: 'The Greeks', ar: 'اليونانيون' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'geo',
    text: { en: 'The El Jem amphitheater is one of the best-preserved examples of what kind of structure?', ar: 'مدرج الجم من أحسن الأمثلة المحفوظة لأي نوع بناء؟' },
    options: [
      { en: 'A Roman amphitheater', ar: 'مدرج روماني' },
      { en: 'A Greek theater', ar: 'مسرح إغريقي' },
      { en: 'An Ottoman fortress', ar: 'قلعة عثمانية' },
      { en: 'A Berber ksar', ar: 'قصر أمازيغي' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'geo',
    text: { en: 'Which desert covers much of southern Tunisia?', ar: 'أي صحراء تغطي جزء كبير من جنوب تونس؟' },
    options: [
      { en: 'The Sahara', ar: 'الصحراء الكبرى' },
      { en: 'The Gobi Desert', ar: 'صحراء ڨوبي' },
      { en: 'The Kalahari', ar: 'صحراء كالاهاري' },
      { en: 'The Atacama', ar: 'صحراء أتاكاما' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'geo',
    text: { en: "Tunisia's highest peak, Jebel ech Chambi, is located near which city?", ar: 'أعلى قمة في تونس، جبل الشعانبي، قريبة من أي مدينة؟' },
    options: [
      { en: 'Kasserine', ar: 'القصرين' },
      { en: 'Tabarka', ar: 'طبرقة' },
      { en: 'Gabès', ar: 'قابس' },
      { en: 'Nabeul', ar: 'نابل' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'geo',
    text: { en: 'Which sea borders Tunisia to the north and east?', ar: 'أي بحر يحد تونس من الشمال و الشرق؟' },
    options: [
      { en: 'The Mediterranean Sea', ar: 'البحر الأبيض المتوسط' },
      { en: 'The Red Sea', ar: 'البحر الأحمر' },
      { en: 'The Atlantic Ocean', ar: 'المحيط الأطلسي' },
      { en: 'The Black Sea', ar: 'البحر الأسود' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'geo',
    text: { en: 'The historic old town at the heart of Tunis, a UNESCO World Heritage site, is called the...', ar: 'المدينة القديمة في قلب تونس العاصمة، المصنفة عالميا، تسمى...' },
    options: [
      { en: 'Medina of Tunis', ar: 'مدينة تونس العتيقة' },
      { en: 'Medina of Sfax', ar: 'مدينة صفاقس العتيقة' },
      { en: 'Kasbah of Algiers', ar: 'قصبة الجزائر' },
      { en: 'Medina of Fez', ar: 'مدينة فاس العتيقة' }
    ],
    correctIndex: 0
  },

  // ---- Food & Cooking ----------------------------------------------------
  {
    categoryKey: 'food',
    text: { en: 'Couscous is traditionally made from which grain?', ar: 'الكسكسي يتحضر أصلا من أي حبة؟' },
    options: [
      { en: 'Semolina (durum wheat)', ar: 'السميد (قمح صلب)' },
      { en: 'Rice', ar: 'الروز' },
      { en: 'Corn', ar: 'الذرة' },
      { en: 'Barley', ar: 'الشعير' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'food',
    text: { en: 'A classic "brik" is typically folded into which shape before frying?', ar: 'البريك التقليدية تتلف بأي شكل قبل ما تقلى؟' },
    options: [
      { en: 'A triangle', ar: 'مثلث' },
      { en: 'A square', ar: 'مربع' },
      { en: 'A circle', ar: 'دائرة' },
      { en: 'A rectangle', ar: 'مستطيل' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'food',
    text: { en: 'Harissa, a staple condiment in Tunisian cooking, is primarily made from what?', ar: 'الهريسة، من أهم المكونات في الأكل التونسي، تتحضر أساسا من شنوة؟' },
    options: [
      { en: 'Chili peppers', ar: 'الفلفل الحار' },
      { en: 'Tomatoes', ar: 'الطماطم' },
      { en: 'Eggplant', ar: 'الباذنجان' },
      { en: 'Chickpeas', ar: 'الحمص' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'food',
    text: { en: 'Which syrup-soaked semolina pastry is a Tunisian favorite, often shaped in diamonds?', ar: 'أي حلوى سميد مغموسة في العسل مشهورة في تونس و تتحضر بشكل معينات؟' },
    options: [
      { en: 'Makroudh', ar: 'مقروض' },
      { en: 'Baklava', ar: 'بقلاوة' },
      { en: 'Basbousa', ar: 'بسبوسة' },
      { en: 'Kunafa', ar: 'كنافة' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'food',
    text: { en: 'Which legume is the base of "Lablabi", a popular Tunisian street food soup?', ar: 'أي بقولة هي أساس "اللبلابي"، شربة شعبية معروفة في تونس؟' },
    options: [
      { en: 'Chickpeas', ar: 'الحمص' },
      { en: 'Lentils', ar: 'العدس' },
      { en: 'Fava beans', ar: 'الفول' },
      { en: 'White beans', ar: 'اللوبيا' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'food',
    text: { en: '"Mechouia" salad is made mainly by grilling which vegetables?', ar: 'سلاطة "مشوية" تتحضر أساسا بشوي أي خضرة؟' },
    options: [
      { en: 'Peppers and tomatoes', ar: 'فلفل و طماطم' },
      { en: 'Cucumbers only', ar: 'خيار بس' },
      { en: 'Carrots only', ar: 'زروديّة بس' },
      { en: 'Potatoes only', ar: 'بطاطا بس' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'food',
    text: { en: '"Ojja" is typically cooked with eggs, harissa and often which type of sausage?', ar: '"العجة" تتطيّب بالعادة بالعظم و الهريسة و مع أي نوع مقانق؟' },
    options: [
      { en: 'Merguez', ar: 'مرڨاز' },
      { en: 'Chorizo', ar: 'شوريزو' },
      { en: 'Bratwurst', ar: 'براتفورست' },
      { en: 'Salami', ar: 'سلامي' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'food',
    text: { en: 'Tunisia is one of the top producers in the world of which oil?', ar: 'تونس من أكبر منتجين في العالم لأي زيت؟' },
    options: [
      { en: 'Olive oil', ar: 'زيت الزيتون' },
      { en: 'Sunflower oil', ar: 'زيت عباد الشمس' },
      { en: 'Palm oil', ar: 'زيت النخيل' },
      { en: 'Corn oil', ar: 'زيت الذرة' }
    ],
    correctIndex: 0
  },

  // ---- Sport ----------------------------------------------------------
  {
    categoryKey: 'sport',
    text: { en: 'In which year did Tunisia win the Africa Cup of Nations as host country?', ar: 'في أي سنة ربحت تونس كأس إفريقيا للأمم و هي البلاد المستضيفة؟' },
    options: [
      { en: '2004', ar: '2004' },
      { en: '2000', ar: '2000' },
      { en: '1994', ar: '1994' },
      { en: '2008', ar: '2008' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'sport',
    text: { en: 'What is the most popular sport in Tunisia?', ar: 'شنوة أكثر رياضة محبوبة في تونس؟' },
    options: [
      { en: 'Football', ar: 'كرة القدم' },
      { en: 'Basketball', ar: 'كرة السلة' },
      { en: 'Handball', ar: 'كرة اليد' },
      { en: 'Volleyball', ar: 'الكرة الطائرة' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'sport',
    text: { en: 'Tunisian swimmer Oussama Mellouli won Olympic gold in Beijing 2008 in which event?', ar: 'السباح التونسي أسامة الميلولي ربح ذهبية أولمبية في بكين 2008 في أي سباق؟' },
    options: [
      { en: '1500m freestyle', ar: '1500 متر سباحة حرة' },
      { en: '100m butterfly', ar: '100 متر فراشة' },
      { en: '200m backstroke', ar: '200 متر ظهر' },
      { en: '50m breaststroke', ar: '50 متر صدر' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'sport',
    text: { en: "What is the nickname of Tunisia's men's national football team?", ar: 'شنوة لقب المنتخب التونسي لكرة القدم؟' },
    options: [
      { en: 'Eagles of Carthage', ar: 'نسور قرطاج' },
      { en: 'Lions of the Atlas', ar: 'أسود الأطلس' },
      { en: 'Pharaohs', ar: 'الفراعنة' },
      { en: 'Elephants', ar: 'الفيلة' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'sport',
    text: { en: 'Which Tunis-based club is among the most decorated in African club football history?', ar: 'أي نادي تونسي من أكثر الأندية تتويجا في تاريخ الكورة الإفريقية؟' },
    options: [
      { en: 'Espérance Sportive de Tunis', ar: 'الترجي الرياضي التونسي' },
      { en: 'Étoile du Sahel', ar: 'النجم الساحلي' },
      { en: 'Club Africain', ar: 'النادي الإفريقي' },
      { en: 'CS Sfaxien', ar: 'النادي الصفاقسي' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'sport',
    text: { en: 'Besides football, Tunisia has traditionally been a strong African and Mediterranean contender in which team sport?', ar: 'زيادة على الكورة، تونس معروفة بمستوى عالي في أي رياضة جماعية أخرى؟' },
    options: [
      { en: 'Handball', ar: 'كرة اليد' },
      { en: 'Rugby', ar: 'الركبي' },
      { en: 'Cricket', ar: 'الكريكات' },
      { en: 'Ice hockey', ar: 'الهوكي على الجليد' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'sport',
    text: { en: 'In which year did Tunisia first qualify for the FIFA World Cup?', ar: 'في أي سنة تأهلت تونس لأول مرة لكأس العالم؟' },
    options: [
      { en: '1978', ar: '1978' },
      { en: '1986', ar: '1986' },
      { en: '1998', ar: '1998' },
      { en: '2002', ar: '2002' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'sport',
    text: { en: 'Tunisian tennis star Ons Jabeur has twice reached the final of which Grand Slam?', ar: 'نجمة التنس التونسية أنس جابر وصلت مرتين لنهائي أي بطولة قراند سلام؟' },
    options: [
      { en: 'Wimbledon', ar: 'ويمبلدون' },
      { en: 'French Open', ar: 'رولان غاروس' },
      { en: 'Australian Open', ar: 'أستراليا المفتوحة' },
      { en: 'US Open', ar: 'أمريكا المفتوحة' }
    ],
    correctIndex: 0
  },

  // ---- Proverbs & Slang -------------------------------------------------
  {
    categoryKey: 'proverbs',
    text: { en: 'The Tunisian proverb "يد وحدة ما تصفقش" (one hand alone can\'t clap) is closest in meaning to which idea?', ar: 'مثل "يد وحدة ما تصفقش" يقرب لأي فكرة؟' },
    options: [
      { en: 'Teamwork and cooperation are necessary', ar: 'التعاون و العمل الجماعي ضروريين' },
      { en: 'Silence is golden', ar: 'السكوت من ذهب' },
      { en: 'Money solves everything', ar: 'الفلوس تحل كل مشكل' },
      { en: 'Actions speak louder than words', ar: 'الأفعال أبلغ من الأقوال' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'proverbs',
    text: { en: 'The proverb "اضرب الحديد و هو سخن" (strike the iron while it\'s hot) means...', ar: 'مثل "اضرب الحديد و هو سخن" معناه...' },
    options: [
      { en: 'Seize the opportunity while it lasts', ar: 'اغتنم الفرصة قبل ما تفوت' },
      { en: 'Avoid dangerous work', ar: 'تجنب الخدمة الخطيرة' },
      { en: 'Cooking takes patience', ar: 'الطبخ يحتاج صبر' },
      { en: 'Metal is stronger than wood', ar: 'الحديد أقوى من الخشب' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'proverbs',
    text: { en: 'In Tunisian slang, "زعمة" is typically used to express...', ar: 'كلمة "زعمة" في الدارجة التونسية تستعمل باش...' },
    options: [
      { en: 'Doubt or sarcasm ("as if", "really?")', ar: 'تعبر على الشك ولا السخرية ("كيفاش زعمة؟")' },
      { en: 'A greeting', ar: 'تحية' },
      { en: 'Gratitude', ar: 'شكر' },
      { en: 'A farewell', ar: 'وداع' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'proverbs',
    text: { en: 'What does the very common Tunisian word "برشة" mean?', ar: 'كلمة "برشة" في التونسي تعني شنوة؟' },
    options: [
      { en: 'A lot / very much', ar: 'بزاف / كثير' },
      { en: 'A little bit', ar: 'شوية' },
      { en: 'Never', ar: 'عمرك' },
      { en: 'Maybe', ar: 'يمكن' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'proverbs',
    text: { en: 'The expression "يعطيك الصحة" is typically said to...', ar: 'عبارة "يعطيك الصحة" تتقال باش...' },
    options: [
      { en: 'Thank or compliment someone for their effort', ar: 'تشكر ولا تثمن جهد حد' },
      { en: 'Say goodbye', ar: 'تودع حد' },
      { en: 'Ask for forgiveness', ar: 'تطلب السماح' },
      { en: 'Wish someone a happy birthday', ar: 'تهني بعيد ميلاد' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'proverbs',
    text: { en: 'The Tunisian word "ساهل" means...', ar: 'كلمة "ساهل" تعني...' },
    options: [
      { en: 'Easy / simple', ar: 'سهل / بسيط' },
      { en: 'Difficult', ar: 'صعيب' },
      { en: 'Expensive', ar: 'غالي' },
      { en: 'Far away', ar: 'بعيد' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'proverbs',
    text: { en: 'The proverb "كل طير بجناحيه يطير" (every bird flies with its own wings) points to which idea?', ar: 'مثل "كل طير بجناحيه يطير" يشير لأي فكرة؟' },
    options: [
      { en: 'Everyone must rely on their own efforts', ar: 'كل واحد يعتمد على جهدو الخاص' },
      { en: 'Birds of a feather flock together', ar: 'الطيور على أشكالها تقع' },
      { en: 'The early bird catches the worm', ar: 'اللي يسبق ياخذ أحسن نصيب' },
      { en: 'Travel broadens the mind', ar: 'السفر يوسع المدارك' }
    ],
    correctIndex: 0
  },
  {
    categoryKey: 'proverbs',
    text: { en: 'In Tunisian slang, "يتقشمر" (yetqashmar) means to...', ar: 'كلمة "يتقشمر" في التونسي تعني...' },
    options: [
      { en: 'Joke around or tease someone', ar: 'يهزر ولا يضحك على حد' },
      { en: 'Cry', ar: 'يبكي' },
      { en: 'Run away', ar: 'يهرب' },
      { en: 'Cook a meal', ar: 'يطيب أكلة' }
    ],
    correctIndex: 0
  }
];

export async function seedDatabase() {
  console.log('[seed] clearing existing categories & questions…');
  await Category.deleteMany({});
  await Question.deleteMany({});

  // 1. Insert Categories
  const insertedCategories = await Category.insertMany(CATEGORIES);
  console.log(`[seed] inserted ${insertedCategories.length} categories`);

  // Map category keys to inserted Mongoose ObjectIds or String keys depending on schema
  const categoryMap = insertedCategories.reduce((acc, cat) => {
    acc[cat.key] = cat._id;
    return acc;
  }, {});

  // 2. Prepare and Insert Questions safely
  const questionsToInsert = RAW_QUESTIONS.map(({ categoryKey, ...q }) => ({
    ...q,
    // Safely handles either ObjectId ref or fallback key string
    category: categoryMap[categoryKey] || categoryKey
  }));

  const insertedQuestions = await Question.insertMany(questionsToInsert);
  console.log(`[seed] inserted ${insertedQuestions.length} questions`);
}

async function runCLI() {
  try {
    await connectDB();
    await seedDatabase();
    await mongoose.disconnect();
    console.log('[seed] done.');
    process.exit(0);
  } catch (err) {
    console.error('[seed] failed:', err);
    process.exit(1);
  }
}

// Updated directory check matching src/seed/categories.seed.js
const isDirectCLI = process.argv[1]?.replace(/\\/g, '/').endsWith('src/seed/categories.seed.js');

if (isDirectCLI) {
  runCLI();
}
/**
 * reports.js (v10.3 Ultra-Fast Optimized)
 * High-Performance Data Reports & XLS Exporter for Namma Sami Namma Kovil
 * 
 * Features:
 *  - Instant Page Load: Uses lightweight hierarchy metadata (~20KB) instead of downloading 52MB upfront.
 *  - Non-Blocking: Zero full-screen lockups; dropdowns are immediately responsive on mobile and desktop.
 *  - On-Demand Regional Streaming: Only loads the selected region's data file (1-3MB gzipped in ~0.2s).
 *  - In-Memory Regional Cache: Once a region is loaded, switching districts/pincodes is instantaneous (0ms).
 *  - SheetJS XLS (.xlsx) Export with customized column headers.
 *  - Mobile-First Adaptive View: Touch cards on mobile (< 768px), clean data table on laptop (>= 768px).
 */

// Global State
const HIERARCHY_DATA = {"1. கன்னியாகுமரி":{"file":"data/regions/region_1.json","districts":{"தென்காசி நகர்":["627514","627809","627810","627811","627814","627817","627851","627852","627853","627858"],"செங்கோட்டை நகர்":["627809"],"ஆலங்குளம் ஒன்றியம்":["627201","627412","627581","627583","627602","627753","627806","627808","627811","627814","627821","627831","627851","627852","627853","627854","627857","627859","627860","627861","627953","637853"],"செங்கோட்டை ஒன்றியம்":["627751","627757","627801","627802","627803","627804","627805","627806","627807","627809","627812","627813","627814","627817","627851","627852","627853","627855","627856","627859","629809"],"தென்காசி ஒன்றியம்":["627415","627423","627514","627802","627803","627804","627805","627806","627807","627808","627809","627811","627812","627813","627814","627817","627818","627851","627852","627856","627858","627859","627860","627861","637805"],"1.கன்னியாகுமரி கிழக்கு":["600019","626801","627760","627808","627851","627953","628721","628910","629001","629002","629003","629005","629156","629159","629162","629165","629175","629177","629180","629201","629203","629204","629209","629251","629252","629301","629401","629502","629521","629601","629801","629802","629804","629806","629807","629809","629810","629901"],"2.கன்னியாகுமரி மேற்கு":["609702","619159","619162","619168","619177","620168","620177","620802","628157","628174","629000","629003","629101","629144","629151","629152","629153","629154","629155","629156","629157","629158","629159","629160","629161","629162","629163","629164","629165","629166","629167","629168","629169","629171","629172","629173","629174","629175","629177","629178","629179","629180","629185","629188","629189","629193","629195","629201","629204","629275","629312","629325","629333","629352","629411","629444","629445","629451","629456","629458","629475","629525","629545","629585","629702","629717","629801","629802","629803","629804","629809","629810","629847","629892","629894","639161","639171","639175","639180","639802","678506"],"4.வள்ளியூர்":["600003","626116","627103","627104","627105","627106","627107","627108","627110","627111","627112","627116","627117","627118","627355","627414","627416","627420","627421","627451","627452","627501","627502","627503","627505","627511","627657","627711","628203"],"7.தூத்துக்குடி":["627809","628001","628002","628003","628008","628102","628103","628151","628202","628203","628204","628205","628207","628213","628215","628501","628601","628611","628612","628623","628704","628712","628718","628721"],"8.கோவில்பட்டி":["618501","626202","626203","627501","627721","627821","627871","627953","628001","628002","628003","628005","628008","628103","628104","628151","628152","628252","628302","628303","628304","628401","628402","628418","628501","628502","628503","628552","628553","628554","628558","628601","628616","628619","628621","628701","628702","628712","628713","628714","628715","628716","628718","628720","628721","628722","628801","628809","628902","628903","628904","628905","628906","628907","628908","628952","628954","629501","629721","629907","638716","638721","639501","678721","698502"],"3.திருநெல்வேலி":["604307","617006","624618","627001","627002","627003","627004","627005","627006","627007","627008","627009","627010","627011","627012","627066","627102","627107","627110","627111","627201","627204","627208","627210","627211","627308","627351","627353","627357","627358","627368","627401","627402","627412","627413","627414","627416","627423","627424","627425","627426","627427","627429","627451","627502","627601","627602","627603","627604","627719","627757","627760","627802","627812","627851","627857","627862","627871","627912","627951","627961","628552"],"6.சங்கரன் கோவில்":["617753","624754","627480","627552","627655","627719","627751","627752","627753","627754","627755","627756","627757","627758","627759","627760","627761","627762","627763","627764","627767","627804","627806","627807","627855","627856","627857","627859","627862","627951","627953","628001","628552","628554","628762","637456","658552"],"கடையம் ஒன்றியம்":["625415","627145","627412","627413","627415","627416","627423","627424","627427","627451","627515","627805","627806","627808","627809","627811","627812","627814","627815","627821","627851","627858","637415"],"கீழப்பாவூர் ஒன்றியம்":["627415","627581","627800","627806","627808","627811","627814","627851","627853","627858","627859","627860","627861"],"சுரண்டை நகர்":["627757","627851","627859"]}},"2. மதுரை":{"file":"data/regions/region_2.json","districts":{"திண்டுக்கல்":[],"1.மதுரை வடக்கு":["624802","625001","625002","625003","625007","625014","625016","625018","625020","625101","625107","625301","625706","626001","627201"],"8. திண்டுக்கல்":["621701","622302","623005","624001","624002","624003","624005","624006","624008","624023","624051","624201","624202","624204","624205","624206","624207","624208","624209","624211","624214","624216","624218","624219","624301","624303","624312","624321","624323","624332","624401","624422","624506","624532","624614","624615","624622","624701","624704","624708","624713","624802","625001","625002","625003","625004","625005","625006","625324","625432"],"6.கம்பம்":["615518","615531","625413","625426","625431","625513","625515","625516","625518","625520","625521","625522","625523","625524","625525","625526","625528","625530","625531","625532","625533","625534","625539","625540","625582","625618","626216","626516","635515","635516","635518","635534"],"5.தேனி":["625203","625512","625513","625517","625518","625520","625530","625531","625533","625534","625579","625601","625634","625831","625834","625861","625901","626513","626531"],"2.மதுரை தெற்கு":["624532","625003","625004","625005","625006","625007","625008","625009","625012","625016","625020","625022","625514","625527","625532","625535","625632","625701","625702","625703","625704","625705","625706","625707","626005","626706","635005","635706"],"7.பழனி":["623621","624005","624101","624212","624306","624601","624602","624603","624612","624613","624614","624615","624616","624617","624618","624619","624621","624622","624631","624701","624702","624703","624704","624710","624712","624719","624721","624801","624802","624803","624862","625003","625601","625619","625631","625710","625802","634601","641602","642619","642621","642801"],"3.விருதுநகர்":["622611","623203","626001","626002","626003","626004","626005","626006","626101","626102","626105","626106","626107","626109","626113","626114","626115","626116","626118","626128","626129","626136","626189","626201","626203","626204","626205","626214","626263","626603","626606","626607","626636","627129","627761","636005"],"4.சிவகாசி":["626117","626123","626125","626130"]}},"3. ராமேஸ்வரம்":{"file":"data/regions/region_3.json","districts":{"பரமக்குடி":[],"6.அறந்தாங்கி":["614616","614622","622003","622201","622301","622302","622303"],"1.ராமநாதபுரம்":["621704","623526","629168"],"5. புதுக்கோட்டை":["613301","613302","613316","620001","620002","620003","620302","621316","621326","621516","622000","622001","622002","622003","622004","622005","622101","622102","622103","622104","622200","622201","622202","622203","622204","622301","622302","622303","622304","622401","622402","622404","622406","622407","622409","622412","622414","622416","622422","622501","622502","622503","622504","622506","622507","622607","623001","623002","623004","623005","623304","623502","632003"],"2.பரமக்குடி":["623527","623533","623603","623604","623701","623704","623707","624707","630606"],"3. சிவகங்கை":["606630","606636","607803","630102","630302","630305","630306","630506","630508","630531","630551","630561","630562","630602","630603","630606","630636","630661","630686","630702","630703","630806","635601","635702","650508"],"4. காரைக்குடி":["630309","630606","630705"]}},"4. கோயம்பத்தூர்":{"file":"data/regions/region_4.json","districts":{"நீலகிரி":["634102","641104","643001","643006","643007","643101","643102","643103","643104","643105","643106","643201","643202","643203","643207","643209","643211","643212","643213","643214","643215","643217","643218","643223","643231","643232","643237","643238","643241","644102","653101","653102","653105","653202"],"கோவை மாநகராட்சி மேற்கு":["624030","641001","641003","641004","641005","641006","641007","641009","641011","641012","641021","641022","641023","641025","641026","641027","641028","641029","641030","641031","641033","641035","641037","641038","641039","641041","641045","641104","641602","651041"],"கோவை மாநகராட்சி கிழக்கு (பட்டீஸ்வார்)":["641002","641003","641004","641005","641006","641008","641009","641024","641028","641036","641041","641047","641602","643101"],"பொள்ளாச்சி":["641007","641024","641045","641105","641671","642001","642002","642003","642004","642005","642006","642007","642104","642105","642107","642110","642117","642120","642125","642126","642127","642130","642134","642202","642227","643002","643107","678002"],"மேட்டுப்பாளையம்":["641001","641012","641020","641022","641050","641102","641104","641301","641402","643001","643231"]}},"5. ஈரோடு":{"file":"data/regions/region_5.json","districts":{"திருப்பூர்":["638103","638607","638701","638751","638752","638812","639103","639752","641602","641603","641604","641605","641606","641607","641652","641654","641664","641665","641666","641667","641669","641682","642665"],"திருச்செங்கோடு":["637211","637501","637503","638182","638183","638311","638503"],"நாமக்கல்":["636001","636114","636118","636142","636202","636301","636407","636408","636503","637001","637003","637013","637015","637017","637018","637019","637020","637301","637401","637402","637406","637407","637408","637409","637411","637415","637418","637503","641601","673407"],"ஈரோடு":["628301","630081","637011","637015","638001","638002","638004","638009","638011","638116","638301","638312","638314","638315","638316","638355","638455","641666","643211"],"தாராபுரம்":["638656","638701","638706","641604"],"கோபிசெட்டிபாளையம்":["638501"]}},"6. சேலம்":{"file":"data/regions/region_6.json","districts":{"தர்மபுரி":["633701","635111","635205","635305","636071","636108","636701","636702","636704","636705","636708","636803","636804","636806","636807","636808","636809","636810","636813","636903","636905","636906","637020","656318"],"சேலம் மாநகராட்சி":["606207","636001","636003","636004","636005","636006","636007","636008","636010","636015","636098","636103","636302","636307","636308","636309","636455","636906","637501","637502","637504","637890"],"ஆத்தூர்":["600032","604307","636008","636102","636104","636105","636106","636108","636112","636114","636115","636117","636121","636134","636136","636138","636139","636148","636601","637138"],"கிருஷ்ணகிரி":["635112","635207","635651"],"சங்ககிரி":["635502","636308","636352","636401","636453","636502","637102","637103","637104","637301","637502"]}},"7. திருச்சிராப்பள்ளி":{"file":"data/regions/region_7.json","districts":{"பெரம்பலூர்":["602108","611104","611116","611717","620012","620112","621101","621102","621103","621104","621106","621107","621108","621109","621113","621114","621115","621116","621117","621118","621125","621126","621133","621204","621207","621208","621212","621213","621218","621219","621220","621221","621312","621317","621319","621708","621712","621713","621714","621716","621717","621718","621719","622133","631103","631104","631133","631208","632717"],"திருச்சி கிழக்கு":["620001","620003","620006","620008","621215","621315","621711","622001","622003"],"திருச்சி மேற்கு":["621007","621652"],"குளித்தலை":[],"கரூர்":[],"அரியலூர்":["601801","608901","611715","611719","612803","612804","612902","612903","612904","621201","621651","621701","621702","621704","621705","621706","621707","621708","621709","621710","621712","621713","621714","621715","621716","621717","621718","621719","621729","621730","621741","621750","621801","621802","621803","621804","621805","621806","621809","621812","621813","621814","621815","621823","621824","621826","621851","621901","621902","621903","621904","621906","622714","622719","627105","627119","631714"]}},"8. தஞ்சாவூர்":{"file":"data/regions/region_8.json","districts":{"திருவாரூர்":["603101","603109","604205","605206","609001","609501","609503","609504","609601","609603","609608","609704","610001","610002","610003","610004","610009","610100","610101","610102","610103","610104","610105","610106","610108","610109","610201","610202","610203","610205","610206","610207","610209","610418","610505","610704","610706","611001","611101","611102","611103","611104","611202","612601","612603","613701","613703","613704","613710","613714","614001","614014","614016","614018","614101","614102","614103","614105","614302","614404","614703","614704","614705","614706","614708","614710","614713","614714","614715","614717","614738","615302","615704","615713","620105","620202","621211","622304"],"கும்பகோணம்":["610001","610107","612001","612103","612204","612302","612408","612605","612702","612703","612705","612801","613204","614210","626135","631204"],"நாகப்பட்டினம்":["609301","609702","609703","610201","610204","611001","611002","611003","611101","611102","611103","611104","611105","611108","611109","611110","611113","612002","614611","614707","614711","614714","614716","614806","614808","614809","614810","621002"],"மயிலாடுதுறை":["609110","609112","609201","609202","609205","658239"],"தஞ்சாவூர்":["610001","610101","613007","613008","613009","613204","614613","622001"]}},"9. விழுப்புரம்":{"file":"data/regions/region_9.json","districts":{"கள்ளக்குறிச்சி":["602802","605301","605401","605607","605657","605701","605751","605754","605756","605757","605766","605781","605801","605802","605851","606101","606102","606104","606107","606115","606182","606201","606202","606205","606206","606207","606209","606212","606213","606305","606401","606402","606502","606506","606575","606657","606751","606754","606757","606801","606802","607201","607202","607204","607401","609206","685751","685757","685802","696401"],"விழுப்புரம்":["600052","602752","604208","604302","604304","605102","605103","605104","605301","605302","605401","605402","605601","605602","605652","605701","605702","605751","605752","605755","605756","605757","605758","605759","605803","606401","606752","607023","607107","607203","608301","608303","608752","685752"],"விருதாச்சலம்":["606001","606003","606101","606110","606303","608701","608703","608803","609703","621719"],"கடலூர்":["600022","600704","600801","601001","602102","603302","603303","606103","607001","607002","607003","607004","607006","607102","607105","607106","607108","607109","607301","607302","607402","607601","608001","608002","608009","608102","608201","608301","608302","608303","608304","608305","608306","608307","608369","608402","608501","608502","608601","608602","608603","608605","608607","608620","608701","608702","608703","608704","608705","608707","608708","608801","609201","609301","609302","632578"],"திண்டிவனம்":["604207"],"பாண்டிச்சேரி":["605001","605008","605009","605106","605502"]}},"10. வேலூர்":{"file":"data/regions/region_10.json","districts":{"திருப்பத்தூர்":["635104","635454","635457","635601","635602","635651","635653","635655","635701","635702","635710","635734","635743","635751","635752","635753","635754","635761","635764","635784","635801","635802","635804","635805","635807","635811","635814","635851","635852","635853","635854","635901","636754","636853","645751","645754","651651","653635","675801","683765"],"திருவண்ணாமலை வடக்கு":["604408","621916","632301"],"வேலூர்":["622012","630012","632001","632002","632003","632004","632005","632006","632007","632008","632009","632010","632011","632012","632015","632019","632020","632105","632106","632107","632201","632519","633002","633007","633105","663202"],"குடியாத்தம்":["632101","635805","635806","635809","635810","641108"],"ராணிப்பேட்டை":["631001","632019","632501","632502","632517","632519"],"திருவண்ணாமலை தெற்கு":["606601"]}},"11. காஞ்சிபுரம்":{"file":"data/regions/region_11.json","districts":{"திருவள்ளூர்":["600003","602001","602023","621209","631201","631204","631205","631207","631209","631210","631211","631212","631215","631303"],"கும்மிடிப்பூண்டி":["600052","600055","600066","600068","601101","601102","601103","601106","601201","601203","601204","602023","602024","602026"],"காஞ்சிபுரம்":["600069","600125","601301","603312","603406","603502","624801","631051","631302","631501","631502","631503","631504","631601","635501","635751","651501"],"ஸ்ரீபெரம்புதூர்":["குன்றத்தூர் ஒன்றியம்","குன்றத்தூர் நகரம்","ஸ்ரீபெரும்புதூர் ஒன்றியம்"],"செங்கல்பட்டு":["603003","603103","603104","603202","603312"],"தாம்பரம்":["600045","600059","600073","600100"],"மதுராந்தகம்":["603302","603305","603306","603312","603313","603412"]}},"12. சென்னை":{"file":"data/regions/region_12.json","districts":{"வடிவுடையம்மன்":["600001","600002","600006","600011","600013","600014","600018","600019","600020","600021","600029","600030","600031","600038","600039","600041","600049","600053","600057","600081","600082","600083","600095","600096","600107","600118","629162"],"கபாலீஸ்வரர்":["600001","600002","600003","600004","600006","600015","600016","600017","600020","600024","600025","600026","600028","600029","600030","600033","600035","600037","600041","600042","600069","600074","600078","600082","600083","600086","600087","600088","600089","600091","600092","600093","600094","600095","600096","600100","600107","600113","600115","600116","600118","600125","600137","600207","602024","603203","608602"],"மத்ஸ்ய நாராயணா":["600001","600013","600014","600016","600027","600037","600042","600043","600061","600074","600088","600089","600091","600096","600097","600098","600100","600112","600114","600115","600116","600118","600119","600125","600127","600129","610109","643212"],"கொடியிடையம்மன்":["600023","600029","600030","600037","600038","600040","600049","600050","600053","600056","600058","600062","600069","600077","600087","600089","600092","600094","600095","600096","600101","600102","600106","600107","600116","600126","600128","607116"],"ரவிஸ்வரர்":["600011","600012","600013","600019","600023","600038","600039","600044","600049","600053","600054","600060","600062","600066","600068","600081","600082","600083","600092","600099","600110","600118"]}}};
let hierarchyData = HIERARCHY_DATA;
const regionCache = {}; // Cache: { "1. கன்னியாகுமரி": [...rows], ... }
let currentRegionRows = [];
let filteredData = [];

let selectedRegion = '';
let selectedDistrict = '';
let selectedPincode = '';

let currentPage = 1;
let pageSize = 25;
let currentModalItem = null;

// Natural Sort Comparator
function naturalCompare(a, b) {
    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

// DOM Initialization
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    setupEventListeners();
    await loadHierarchy();
});

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('nsnk_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('nsnk_theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    if (!themeIcon || !themeText) return;
    if (theme === 'light') {
        themeIcon.setAttribute('data-lucide', 'sun');
        themeText.textContent = 'Light';
    } else {
        themeIcon.setAttribute('data-lucide', 'moon');
        themeText.textContent = 'Dark';
    }
    if (window.lucide) lucide.createIcons();
}

// Setup Event Listeners
function setupEventListeners() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMeaningModal();
    });

    const modalOverlay = document.getElementById('meaning-modal');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeMeaningModal();
        });
    }
}

// Load Lightweight Hierarchy Map (Only ~20KB)
async function loadHierarchy() {
    hierarchyData = HIERARCHY_DATA;
    populateRegionDropdown();
    console.log('✅ Initialized embedded hierarchy.');
}

// Populate Region Dropdown from Hierarchy
function populateRegionDropdown() {
    const regionSelect = document.getElementById('filter-region');
    if (!regionSelect || !hierarchyData) return;

    const regions = Object.keys(hierarchyData).sort(naturalCompare);

    regionSelect.innerHTML = '<option value="">-- மண்டலத்தை தேர்வு செய்க (Select Region) --</option>';
    regions.forEach(reg => {
        const opt = document.createElement('option');
        opt.value = reg;
        opt.textContent = reg;
        regionSelect.appendChild(opt);
    });

    // Add option for All Regions
    const optAll = document.createElement('option');
    optAll.value = '__ALL__';
    optAll.textContent = '🌐 அனைத்து மண்டலங்களும் (All Regions)';
    regionSelect.appendChild(optAll);
}

// Fallback Region list if hierarchy.json fails
function populateFallbackRegions() {
    const regionSelect = document.getElementById('filter-region');
    if (!regionSelect) return;

    const regions = [
        "1. கன்னியாகுமரி", "2. மதுரை", "3. ராமேஸ்வரம்", "4. கோயம்பத்தூர்",
        "5. ஈரோடு", "6. சேலம்", "7. திருச்சிராப்பள்ளி", "8. தஞ்சாவூர்",
        "9. விழுப்புரம்", "10. வேலூர்", "11. காஞ்சிபுரம்", "12. சென்னை"
    ];

    regionSelect.innerHTML = '<option value="">-- மண்டலத்தை தேர்வு செய்க (Select Region) --</option>';
    regions.forEach(reg => {
        const opt = document.createElement('option');
        opt.value = reg;
        opt.textContent = reg;
        regionSelect.appendChild(opt);
    });
}

// Region Change Handler
function onRegionChange() {
    const regionSelect = document.getElementById('filter-region');
    const districtSelect = document.getElementById('filter-district');
    const pincodeSelect = document.getElementById('filter-pincode');

    selectedRegion = regionSelect ? regionSelect.value.trim() : '';
    selectedDistrict = '';
    selectedPincode = '';

    if (!hierarchyData || !selectedRegion || selectedRegion === '__ALL__') {
        if (districtSelect) {
            districtSelect.innerHTML = '<option value="">-- அனைத்து மாவட்டங்களும் (All Districts) --</option>';
        }
        if (pincodeSelect) {
            pincodeSelect.innerHTML = '<option value="">-- அனைத்து பின்கோடுகளும் (All Pincodes) --</option>';
        }
        return;
    }

    const regObj = hierarchyData[selectedRegion];
    if (!regObj) return;

    // Populate Districts for selected Region
    const districts = Object.keys(regObj.districts || {}).sort(naturalCompare);
    if (districtSelect) {
        districtSelect.innerHTML = `<option value="">-- அனைத்து மாவட்டங்களும் (${districts.length}) / All Districts --</option>`;
        districts.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d;
            opt.textContent = d;
            districtSelect.appendChild(opt);
        });
    }

    // Populate All Pincodes in this Region
    updatePincodesFromHierarchy(selectedRegion, '');

    // Background pre-fetch of this region file so it's ready when user clicks Apply
    fetchRegionData(selectedRegion).catch(console.warn);
}

// District Change Handler
function onDistrictChange() {
    const districtSelect = document.getElementById('filter-district');
    selectedDistrict = districtSelect ? districtSelect.value.trim() : '';
    selectedPincode = '';

    updatePincodesFromHierarchy(selectedRegion, selectedDistrict);
}

// Pincode Change Handler
function onPincodeChange() {
    const pincodeSelect = document.getElementById('filter-pincode');
    selectedPincode = pincodeSelect ? pincodeSelect.value.trim() : '';
}

// Helper: Populate Pincode dropdown instantly from Hierarchy
function updatePincodesFromHierarchy(region, district) {
    const pincodeSelect = document.getElementById('filter-pincode');
    if (!pincodeSelect || !hierarchyData || !region || region === '__ALL__') {
        if (pincodeSelect) pincodeSelect.innerHTML = '<option value="">-- அனைத்து பின்கோடுகளும் (All Pincodes) --</option>';
        return;
    }

    const regObj = hierarchyData[region];
    if (!regObj || !regObj.districts) return;

    let pins = [];
    if (district && regObj.districts[district]) {
        pins = regObj.districts[district];
    } else {
        const pinSet = new Set();
        Object.values(regObj.districts).forEach(arr => {
            arr.forEach(p => pinSet.add(p));
        });
        pins = Array.from(pinSet);
    }

    pins.sort((a, b) => {
        const nA = parseInt(a, 10);
        const nB = parseInt(b, 10);
        if (!isNaN(nA) && !isNaN(nB)) return nA - nB;
        return naturalCompare(a, b);
    });

    pincodeSelect.innerHTML = `<option value="">-- அனைத்து பின்கோடுகளும் (${pins.length}) / All Pincodes --</option>`;
    pins.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        pincodeSelect.appendChild(opt);
    });
}

// Fetch Region Data with In-Memory Caching (Streams ~1-3MB instead of 52MB)
async function fetchRegionData(regionName) {
    if (regionCache[regionName]) {
        return regionCache[regionName];
    }

    let filePath = '';
    if (hierarchyData && hierarchyData[regionName] && hierarchyData[regionName].file) {
        filePath = hierarchyData[regionName].file;
    } else {
        // Fallback file pattern
        const numMatch = regionName.match(/^(\d+)\./);
        const idx = numMatch ? numMatch[1] : '1';
        filePath = `data/regions/region_${idx}.json`;
    }

    const resp = await fetch(filePath);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: Could not load ${filePath}`);
    
    const rows = await resp.json();
    regionCache[regionName] = rows;
    console.log(`✅ Loaded ${regionName} (${rows.length} rows) into cache.`);
    return rows;
}

// Load All Regions if user explicitly selects All Regions
async function fetchAllRegionsData(progressCallback) {
    if (!hierarchyData) return [];

    const regionKeys = Object.keys(hierarchyData).sort(naturalCompare);
    let allRows = [];

    for (let i = 0; i < regionKeys.length; i++) {
        const reg = regionKeys[i];
        if (progressCallback) progressCallback(i + 1, regionKeys.length, reg);
        const rows = await fetchRegionData(reg);
        allRows = allRows.concat(rows);
    }

    return allRows;
}

// Apply Filters Action
async function applyFilters(shouldScroll = true) {
    const regionSelect = document.getElementById('filter-region');
    const districtSelect = document.getElementById('filter-district');
    const pincodeSelect = document.getElementById('filter-pincode');
    const applyBtn = document.querySelector('.btn-apply');
    const countBadge = document.getElementById('stat-match-count');

    selectedRegion = regionSelect ? regionSelect.value.trim() : '';
    selectedDistrict = districtSelect ? districtSelect.value.trim() : '';
    selectedPincode = pincodeSelect ? pincodeSelect.value.trim() : '';

    if (!selectedRegion) {
        alert('தயவுசெய்து ஒரு மண்டலத்தை தேர்வு செய்யவும்! (Please select a Region)');
        if (regionSelect) regionSelect.focus();
        return;
    }

    // Set Loading UI on button and badge
    if (applyBtn) {
        applyBtn.innerHTML = '<i data-lucide="loader-2" class="spin" style="width:16px; height:16px;"></i> <span>ஏற்றப்படுகிறது...</span>';
        applyBtn.disabled = true;
    }
    if (countBadge) {
        countBadge.innerHTML = '<i data-lucide="loader-2" class="spin" style="width:18px; height:18px; color:var(--accent-secondary);"></i> <span>தரவு தயாராகிறது...</span>';
    }
    if (window.lucide) lucide.createIcons();

    try {
        let rows = [];

        if (selectedRegion === '__ALL__') {
            // Load all regions sequentially with progress
            rows = await fetchAllRegionsData((current, total, regName) => {
                if (countBadge) {
                    countBadge.textContent = `மண்டலம் ${current}/${total} (${regName}) ஏற்றப்படுகிறது...`;
                }
            });
        } else {
            // Load only selected region (fast!)
            rows = await fetchRegionData(selectedRegion);
        }

        currentRegionRows = rows;

        // Filter by District and Pincode
        filteredData = currentRegionRows.filter(item => {
            if (selectedDistrict && (item.district || '').trim() !== selectedDistrict) {
                return false;
            }
            if (selectedPincode) {
                const itemPin = String(item.pincode || '').trim();
                if (itemPin !== selectedPincode) return false;
            }
            return true;
        });

        currentPage = 1;
        renderData();

        if (shouldScroll) {
            const resultsSec = document.getElementById('results-section');
            if (resultsSec) resultsSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

    } catch (err) {
        console.error('❌ Error applying filter:', err);
        alert(`தரவு ஏற்றுவதில் பிழை: ${err.message}`);
        if (countBadge) countBadge.textContent = 'பிழை ஏற்பட்டது / Load Error';
    } finally {
        if (applyBtn) {
            applyBtn.innerHTML = '<i data-lucide="filter" style="width:16px; height:16px;"></i> <span>வடிகட்டு (Apply Filter)</span>';
            applyBtn.disabled = false;
            if (window.lucide) lucide.createIcons();
        }
    }
}

// Reset Filters Action
function resetFilters() {
    selectedRegion = '';
    selectedDistrict = '';
    selectedPincode = '';

    const regionSelect = document.getElementById('filter-region');
    const districtSelect = document.getElementById('filter-district');
    const pincodeSelect = document.getElementById('filter-pincode');

    if (regionSelect) regionSelect.value = '';
    if (districtSelect) districtSelect.innerHTML = '<option value="">-- அனைத்து மாவட்டங்களும் (All Districts) --</option>';
    if (pincodeSelect) pincodeSelect.innerHTML = '<option value="">-- அனைத்து பின்கோடுகளும் (All Pincodes) --</option>';

    filteredData = [];
    currentRegionRows = [];
    currentPage = 1;

    renderData();
}

// Render Data (Table + Cards + Counts + Pagination)
function renderData() {
    const totalCount = filteredData.length;
    
    // Update Match Count Badge
    const countBadge = document.getElementById('stat-match-count');
    if (countBadge) {
        countBadge.textContent = `${totalCount.toLocaleString()} பதிவுகள் / Records`;
    }

    // Update XLS Export Button State
    const exportBtn = document.getElementById('btn-export-xls');
    if (exportBtn) {
        exportBtn.disabled = (totalCount === 0);
        exportBtn.style.opacity = totalCount === 0 ? '0.4' : '1';
        exportBtn.style.cursor = totalCount === 0 ? 'not-allowed' : 'pointer';
    }

    // Empty State vs Data Display
    const emptyState = document.getElementById('empty-state');
    const contentArea = document.getElementById('data-content-area');
    const paginationArea = document.getElementById('pagination-container');

    if (totalCount === 0) {
        if (emptyState) {
            emptyState.style.display = 'block';
            emptyState.innerHTML = `
                <i data-lucide="inbox" style="width:36px; height:36px; color:var(--text-muted); margin-bottom:8px;"></i>
                <div style="font-size:0.95rem; color:var(--text-main); font-weight:700;">
                    ${selectedRegion ? 'தேர்ந்தெடுத்த வடிகட்டலுக்கு பதிவுகள் எதுவும் கிடைக்கவில்லை (No Records Found)' : 'மண்டலத்தை தேர்வு செய்து "வடிகட்டு" பொத்தானை அழுத்தவும் (Select Region above and click Apply Filter)'}
                </div>
            `;
        }
        if (contentArea) contentArea.style.display = 'none';
        if (paginationArea) paginationArea.style.display = 'none';
        if (window.lucide) lucide.createIcons();
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (contentArea) contentArea.style.display = 'block';
    if (paginationArea) paginationArea.style.display = 'flex';

    // Slice for Current Page
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalCount);
    const pageRows = filteredData.slice(startIndex, endIndex);

    // Render Views
    renderTableView(pageRows, startIndex);
    renderCardsView(pageRows, startIndex);

    // Render Pagination
    renderPagination(totalCount, startIndex, endIndex);

    // Initialize Lucide Icons
    if (window.lucide) lucide.createIcons();
}

// Helper: Grade Badge HTML
function getGradeBadge(grade) {
    const g = (grade || 'Ungraded').trim();
    if (g === 'Grade A') return '<span class="grade-badge grade-badge-a">A Grade</span>';
    if (g === 'Grade B') return '<span class="grade-badge grade-badge-b">B Grade</span>';
    if (g === 'Grade C') return '<span class="grade-badge grade-badge-c">C Grade</span>';
    return '<span class="grade-badge grade-badge-u">Ungraded</span>';
}

// Helper: Clean phone number
function cleanPhone(phone) {
    if (!phone) return '';
    return String(phone).replace(/\D/g, '');
}

// Render Table View (Desktop / Laptop)
function renderTableView(rows, startIndex) {
    const tbody = document.getElementById('report-table-body');
    if (!tbody) return;

    let html = '';
    rows.forEach((item, idx) => {
        const globalIndex = startIndex + idx;
        const rowNum = globalIndex + 1;
        const phone = cleanPhone(item.mobile);
        const pincodeDisplay = item.pincode ? escapeHtml(String(item.pincode)) : '-';
        const unionDisplay = item.union ? escapeHtml(item.union) : '-';

        html += `
            <tr>
                <td style="text-align:center; color:var(--text-muted); font-size:0.8rem;">${rowNum}</td>
                <td style="font-weight:700; font-family:var(--font-tamil); font-size:0.95rem; color:var(--text-main);">
                    ${escapeHtml(item.name || '-')}
                </td>
                <td>
                    ${phone ? `
                        <div style="display:flex; align-items:center; gap:6px;">
                            <a href="tel:${phone}" style="color:#60a5fa; text-decoration:none;" title="Call">
                                <i data-lucide="phone" style="width:13px; height:13px; vertical-align:middle;"></i>
                                <span>${escapeHtml(item.mobile)}</span>
                            </a>
                            <a href="https://wa.me/91${phone}" target="_blank" rel="noopener" style="display:inline-flex; align-items:center;" title="WhatsApp">
                                <i data-lucide="message-circle" style="width:13px; height:13px; color:#25D366;"></i>
                            </a>
                        </div>
                    ` : '<span style="color:var(--text-dim);">-</span>'}
                </td>
                <td style="color:var(--text-muted); font-size:0.85rem;">${escapeHtml(item.region || '-')}</td>
                <td style="color:var(--text-main); font-weight:600; font-size:0.85rem;">${escapeHtml(item.district || '-')}</td>
                <td style="color:var(--text-muted); font-size:0.85rem;">${unionDisplay}</td>
                <td style="font-family:monospace; font-weight:700; color:#10b981;">${pincodeDisplay}</td>
                <td>${getGradeBadge(item.grade)}</td>
                <td>
                    <button type="button" class="btn-modal-link" onclick="openMeaningModal(${globalIndex})" title="View Meaning">
                        <i data-lucide="book-open" style="width:12px; height:12px;"></i> விளக்கம்
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// Render Cards View (Mobile Phones)
function renderCardsView(rows, startIndex) {
    const container = document.getElementById('cards-view-container');
    if (!container) return;

    let html = '';
    rows.forEach((item, idx) => {
        const globalIndex = startIndex + idx;
        const rowNum = globalIndex + 1;
        const phone = cleanPhone(item.mobile);
        const pincodeDisplay = item.pincode ? escapeHtml(String(item.pincode)) : 'இல்லை';
        const unionDisplay = item.union ? escapeHtml(item.union) : '-';

        html += `
            <div class="person-item-card">
                <div class="card-top">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">#${rowNum}</span>
                        <h4 class="person-title">${escapeHtml(item.name || '-')}</h4>
                    </div>
                    <div>${getGradeBadge(item.grade)}</div>
                </div>

                <div class="card-contacts">
                    ${phone ? `
                        <a href="tel:${phone}" class="btn-call">
                            <i data-lucide="phone" style="width:13px; height:13px;"></i>
                            <span>${escapeHtml(item.mobile)}</span>
                        </a>
                        <a href="https://wa.me/91${phone}" target="_blank" rel="noopener" class="btn-wa">
                            <i data-lucide="send" style="width:13px; height:13px;"></i>
                            <span>WhatsApp</span>
                        </a>
                    ` : '<span style="color:var(--text-dim); font-size:0.82rem;">எண் இல்லை</span>'}
                </div>

                <div class="card-geo">
                    <div><span style="color:var(--text-muted);">மண்டலம்:</span> <strong>${escapeHtml(item.region || '-')}</strong></div>
                    <div><span style="color:var(--text-muted);">மாவட்டம்:</span> <strong>${escapeHtml(item.district || '-')}</strong></div>
                    <div><span style="color:var(--text-muted);">ஒன்றியம்:</span> <strong>${unionDisplay}</strong></div>
                    <div><span style="color:var(--text-muted);">பின்கோடு:</span> <strong style="color:#10b981;">${pincodeDisplay}</strong></div>
                </div>

                <div>
                    <button type="button" class="btn-modal-link" style="width:100%; justify-content:center; padding:8px;" onclick="openMeaningModal(${globalIndex})">
                        <i data-lucide="book-open" style="width:13px; height:13px;"></i>
                        <span>விளக்கம் வாசிக்க (View Meaning)</span>
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Render Pagination Controls
function renderPagination(totalCount, startIndex, endIndex) {
    const container = document.getElementById('pagination-container');
    if (!container) return;

    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    let jumpOptions = '';
    const maxSelectPages = Math.min(totalPages, 500);
    for (let p = 1; p <= maxSelectPages; p++) {
        jumpOptions += `<option value="${p}" ${p === currentPage ? 'selected' : ''}>Page ${p}</option>`;
    }

    container.innerHTML = `
        <div style="font-size:0.86rem; color:var(--text-muted);">
            காட்டுவது: <strong>${startIndex + 1} - ${endIndex}</strong> / மொத்தம்: <strong>${totalCount.toLocaleString()}</strong> 
            (பக்கம் ${currentPage} / ${totalPages})
        </div>

        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; justify-content:center;">
            <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
                <i data-lucide="chevron-left" style="width:15px; height:15px;"></i> முந்தையது
            </button>

            <select class="filter-select" style="height:36px; width:auto; padding:0 8px; font-size:0.82rem;" onchange="changePage(parseInt(this.value, 10))">
                ${jumpOptions}
            </select>

            <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
                அடுத்தது <i data-lucide="chevron-right" style="width:15px; height:15px;"></i>
            </button>

            <select class="filter-select" style="height:36px; width:auto; padding:0 8px; font-size:0.82rem;" onchange="changePageSize(this.value)">
                <option value="25" ${pageSize === 25 ? 'selected' : ''}>25 Rows</option>
                <option value="50" ${pageSize === 50 ? 'selected' : ''}>50 Rows</option>
                <option value="100" ${pageSize === 100 ? 'selected' : ''}>100 Rows</option>
                <option value="250" ${pageSize === 250 ? 'selected' : ''}>250 Rows</option>
            </select>
        </div>
    `;
}

function changePage(newPage) {
    const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
    if (newPage < 1 || newPage > totalPages) return;
    currentPage = newPage;
    renderData();

    const resultsSec = document.getElementById('results-section');
    if (resultsSec) resultsSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function changePageSize(size) {
    pageSize = parseInt(size, 10) || 25;
    currentPage = 1;
    renderData();
}

// Meaning Modal Logic
function openMeaningModal(index) {
    const item = filteredData[index];
    if (!item) return;

    currentModalItem = item;

    const modal = document.getElementById('meaning-modal');
    const nameEl = document.getElementById('modal-person-name');
    const phoneEl = document.getElementById('modal-person-phone');
    const gradeEl = document.getElementById('modal-person-grade');
    const locEl = document.getElementById('modal-person-location');
    const textEl = document.getElementById('modal-meaning-text');
    const copyBtn = document.getElementById('btn-modal-copy');

    if (nameEl) nameEl.textContent = item.name || '-';
    if (phoneEl) {
        const phone = cleanPhone(item.mobile);
        phoneEl.innerHTML = phone ? `
            <a href="tel:${phone}" style="color:#60a5fa; text-decoration:none;">
                <i data-lucide="phone" style="width:13px; height:13px; vertical-align:middle;"></i> ${escapeHtml(item.mobile)}
            </a>
        ` : 'எண் இல்லை';
    }
    if (gradeEl) gradeEl.innerHTML = getGradeBadge(item.grade);
    if (locEl) {
        locEl.textContent = `${item.region || '-'} ➔ ${item.district || '-'} ➔ ${item.union || '-'} (${item.pincode || 'பின்கோடு இல்லை'})`;
    }
    if (textEl) textEl.textContent = item.meaning || 'விளக்கம் இல்லை.';

    if (copyBtn) {
        copyBtn.innerHTML = '<i data-lucide="copy" style="width:14px; height:14px;"></i> <span>நகலெடு (Copy Meaning)</span>';
    }

    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    if (window.lucide) lucide.createIcons();
}

function closeMeaningModal() {
    const modal = document.getElementById('meaning-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    currentModalItem = null;
}

function copyModalMeaning() {
    if (!currentModalItem || !currentModalItem.meaning) return;

    const copyText = `${currentModalItem.name}\n${currentModalItem.meaning}\n(நம்ம சாமி நம்ம கோவில்)`;

    navigator.clipboard.writeText(copyText).then(() => {
        const copyBtn = document.getElementById('btn-modal-copy');
        if (copyBtn) {
            copyBtn.innerHTML = '<i data-lucide="check" style="width:14px; height:14px; color:#10b981;"></i> <span style="color:#10b981;">நகலெடுக்கப்பட்டது!</span>';
            if (window.lucide) lucide.createIcons();
            setTimeout(() => {
                if (copyBtn) {
                    copyBtn.innerHTML = '<i data-lucide="copy" style="width:14px; height:14px;"></i> <span>நகலெடு (Copy Meaning)</span>';
                    if (window.lucide) lucide.createIcons();
                }
            }, 2000);
        }
    }).catch(err => {
        console.error('Copy failed:', err);
    });
}

// Export to XLS (SheetJS)
function exportToXLS() {
    if (!filteredData || filteredData.length === 0) {
        alert('பதிவுகள் எதுவும் இல்லை! (No records to export)');
        return;
    }

    const exportBtn = document.getElementById('btn-export-xls');
    const originalBtnText = exportBtn ? exportBtn.innerHTML : '';

    if (exportBtn) {
        exportBtn.innerHTML = '<i data-lucide="loader-2" class="spin" style="width:16px; height:16px;"></i> <span>பதிவிறக்கம் ஆகிறது...</span>';
        exportBtn.disabled = true;
        if (window.lucide) lucide.createIcons();
    }

    setTimeout(() => {
        try {
            const rows = filteredData.map((item, idx) => ({
                'வரிசை எண் (S.No)': idx + 1,
                'பெயர் (Name)': item.name || '',
                'தொடர்பு எண் (Mobile)': item.mobile || '',
                'மண்டலம் (Region)': item.region || '',
                'மாவட்டம் (District)': item.district || '',
                'ஒன்றியம் (Union)': item.union || '',
                'பின்கோடு (Pincode)': item.pincode || '',
                'தரம் (Grade)': item.grade || '',
                'தமிழ் பெயர் விளக்கம் (Meaning)': item.meaning || ''
            }));

            const worksheet = XLSX.utils.json_to_sheet(rows);

            worksheet['!cols'] = [
                { wch: 10 },
                { wch: 22 },
                { wch: 16 },
                { wch: 22 },
                { wch: 24 },
                { wch: 22 },
                { wch: 12 },
                { wch: 14 },
                { wch: 65 }
            ];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'NSNK_Report');

            const sanitize = (str) => (str || 'All').replace(/[^\w\u0B80-\u0BFF]/g, '_').substring(0, 20);
            const rTag = sanitize(selectedRegion);
            const dTag = sanitize(selectedDistrict);
            const pTag = sanitize(selectedPincode);
            const today = new Date().toISOString().slice(0, 10);

            const filename = `NSNK_Data_${rTag}_${dTag}_${pTag}_${today}.xlsx`;

            XLSX.writeFile(workbook, filename);

            showToast(`✅ ${filteredData.length.toLocaleString()} பதிவுகள் XLS கோப்பாக பதிவிறக்கம் செய்யப்பட்டன!`);

        } catch (err) {
            console.error('❌ Failed to export XLS:', err);
            alert(`XLS பதிவிறக்கத்தில் பிழை: ${err.message}`);
        } finally {
            if (exportBtn) {
                exportBtn.innerHTML = originalBtnText;
                exportBtn.disabled = false;
                if (window.lucide) lucide.createIcons();
            }
        }
    }, 100);
}

// Toast Notification
function showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'app-toast';
        toast.className = 'app-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 3500);
}

// HTML Escaping utility
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { WebcastPushConnection } from "tiktok-live-connector";
import path from "path";
import { createServer as createViteServer } from "vite";

const dictionary: Record<number, string[]> = {
  5: [
    "APPLE", "BEACH", "BRAIN", "BREAD", "BRUSH", "CHAIR", "CHEST", "CHORD", "CLICK", "CLOCK", "CLOUD", "DANCE", "DIARY", "DRINK", "DRIVE", "EARTH", "FEAST", "FIELD", "FRUIT", "GLASS", "GRAPE", "GREEN", "GHOST", "HEART", "HOUSE", "JUICE", "LIGHT", "LEMON", "MELON", "MONEY", "MUSIC", "NIGHT", "OCEAN", "PARTY", "PIANO", "PILOT", "PLANE", "PHONE", "PIZZA", "PLANT", "RADIO", "RIVER", "ROBOT", "SHIRT", "SHOES", "SMILE", "SNAKE", "SPACE", "SPOON", "STORM", "TABLE", "TIGER", "TOAST", "TOUCH", "TRAIN", "TRUCK", "VOICE", "WATER", "WHALE", "WORLD", "WRITE", "YACHT", "ZEBRA",
    "ADULT", "AGENT", "ANGER", "APPLE", "AWARD", "BASIS", "BIRTH", "BLOCK", "BLOOD", "BOARD", "BRAIN", "BREAD", "BREAK", "BROWN", "BUYER", "CAUSE", "CHAIN", "CHAIR", "CHART", "CHECK", "CHEST", "CHIEF", "CHILD", "CHINA", "CLAIM", "CLASS", "CLOCK", "COAST", "COURT", "COVER", "CREAM", "CRIME", "CROSS", "CROWD", "CROWN", "CYCLE", "DANCE", "DEATH", "DEPTH", "DOUBT", "DRAFT", "DRAMA", "DREAM", "DRESS", "DRINK", "DRIVE", "EARTH", "ENEMY", "ENTRY", "ERROR", "EVENT", "FAITH", "FAULT", "FIELD", "FIGHT", "FINAL", "FLOOR", "FOCUS", "FORCE", "FRAME", "FRANK", "FRONT", "FRUIT", "GLASS", "GRANT", "GRASS", "GREEN", "GROUP", "GUIDE", "HEART", "HENRY", "HORSE", "HOTEL", "HOUSE", "IMAGE", "INDEX", "INPUT", "ISSUE", "JAPAN", "JONES", "JUDGE", "KNIFE", "LAURA", "LAYER", "LEVEL", "LIGHT", "LIMIT", "LUNCH", "MAJOR", "MARCH", "MATCH", "METAL", "MODEL", "MONEY", "MONTH", "MOTOR", "MOUTH", "MUSIC", "NIGHT", "NOISE", "NORTH", "NOVEL", "NURSE", "OFFER", "ORDER", "OTHER", "OWNER", "PANEL", "PAPER", "PARTY", "PEACE", "PETER", "PHASE", "PHONE", "PIANO", "PILOT", "PITCH", "PLACE", "PLANE", "PLANT", "PLATE", "POINT", "POUND", "POWER", "PRESS", "PRICE", "PRIDE", "PRIZE", "PROOF", "QUEEN", "RADIO", "RANGE", "RATIO", "REPLY", "RIGHT", "RIVER", "ROUND", "ROUTE", "RUGBY", "SCALE", "SCENE", "SCOPE", "SCORE", "SENSE", "SHAPE", "SHARE", "SHEEP", "SHEET", "SHIFT", "SHIRT", "SHOCK", "SHOOT", "SIGHT", "SIMON", "SKILL", "SLEEP", "SMILE", "SMITH", "SMOKE", "SOUND", "SOUTH", "SPACE", "SPEED", "SPITE", "SPORT", "SQUAD", "STAFF", "STAGE", "START", "STATE", "STEAM", "STEEL", "STOCK", "STONE", "STORE", "STUDY", "STUFF", "STYLE", "SUGAR", "TABLE", "TASTE", "TERRY", "THEME", "THING", "TITLE", "TOTAL", "TOUCH", "TOWER", "TRACK", "TRADE", "TRAIN", "TREND", "TRIAL", "TRUST", "TRUTH", "UNCLE", "UNION", "UNITY", "VALUE", "VIDEO", "VISIT", "VOICE", "WASTE", "WATCH", "WATER", "WHILE", "WHITE", "WHOLE", "WOMAN", "WORLD", "YOUTH"
  ],
  6: [
    "BREEZE", "BRIGHT", "CASTLE", "DANGER", "ENERGY", "FLOWER", "GARDEN", "HEALTH", "ISLAND", "JUNGLE", "KITTEN", "LEMONS", "MARKET", "NATURE", "ORANGE", "PLANET", "QUARTZ", "RELIEF", "SILVER", "TICKET", "UNIQUE", "VALLEY", "WINTER", "YELLOW", "ZODIAC",
    "ABROAD", "ACCEPT", "ACCESS", "ACROSS", "ACTING", "ACTION", "ACTIVE", "ACTUAL", "ADVICE", "ADVISE", "AFFECT", "AFFORD", "AFRAID", "AGENCY", "AGENDA", "ALMOST", "ALWAYS", "AMOUNT", "ANIMAL", "ANNUAL", "ANSWER", "ANYONE", "ANYWAY", "APPEAR", "AROUND", "ARRIVE", "ARTIST", "ASPECT", "ASSESS", "ASSIST", "ASSUME", "ATTACK", "ATTEND", "AUGUST", "AUTHOR", "AVENUE", "BACKED", "BARELY", "BATTLE", "BEAUTY", "BECAME", "BECOME", "BEFORE", "BEHALF", "BEHIND", "BELIEF", "BELONG", "BERLIN", "BETTER", "BEYOND", "BISHOP", "BORDER", "BOTTLE", "BOTTOM", "BOUGHT", "BRANCH", "BREATH", "BRIDGE", "BRIGHT", "BROKEN", "BUDGET", "BURDEN", "BUREAU", "BUTTON", "CAMERA", "CANCER", "CANNOT", "CARBON", "CAREER", "CASTLE", "CASUAL", "CAUGHT", "CENTER", "CENTRE", "CHANCE", "CHANGE", "CHARGE", "CHOICE", "CHOOSE", "CHURCH", "CIRCLE", "CLIENT", "CLOSED", "CLOSER", "COFFEE", "COLUMN", "COMBAT", "COMING", "COMMON", "COMPLY", "COPPER", "CORNER", "COSTLY", "COUNTY", "COUPLE", "COURSE", "COVERS", "CREATE", "CREDIT", "CRISIS", "CRITIC", "CUSTOM", "DAMAGE", "DANGER", "DEALER", "DEBATE", "DECADE", "DECIDE", "DEFEAT", "DEFEND", "DEFINE", "DEGREE", "DEMAND", "DEPEND", "DEPUTY", "DESERT", "DESIGN", "DESIRE", "DETAIL", "DETECT", "DEVICE", "DIFFER", "DINNER", "DIRECT", "DOCTOR", "DOLLAR", "DOMAIN", "DOUBLE", "DRIVEN", "DRIVER", "DURING", "EASILY", "EATING", "EDITOR", "EFFECT", "EFFORT", "EIGHTY", "EITHER", "ELEVEN", "EMERGE", "EMPIRE", "EMPLOY", "ENABLE", "ENERGY", "ENGAGE", "ENGINE", "ENOUGH", "ENSURE", "ENTIRE", "ENTITY", "EQUITY", "ESCAPE", "ESTATE", "ETHNIC", "EUROPE", "EVENTS", "EXCEPT", "EXPECT", "EXPERT", "EXPORT", "EXTENT", "FABRIC", "FACING", "FACTOR", "FAILED", "FAIRLY", "FAMILY", "FAMOUS", "FATHER", "FELLOW", "FEMALE", "FIGURE", "FILLED", "FILTER", "FINALE", "FINISH", "FISCAL", "FLIGHT", "FLYING", "FOLLOW", "FORCED", "FORMAL", "FORMAT", "FORMER", "FOSTER", "FOUGHT", "FOURTH", "FRENCH", "FRIEND", "FUTURE", "GARDEN", "GATHER", "GENDER", "GENTLY", "GERMAN", "GLOBAL", "GOLDEN", "GOVERN", "GRABBED", "GRADES", "GRAHAM", "GREECE", "GROUND", "GROUPS", "GROWTH", "GUILTY", "GUITAR", "HANDLE", "HAPPEN", "HARDLY", "HEALTH", "HEIGHT", "HIDDEN", "HOLDER", "HONEST", "IMPACT", "IMPORT", "INCOME", "INDEED", "INDOOR", "INJURY", "INSIDE", "INTEND", "INTENT", "INVEST", "ISLAND", "ITSELF", "JERSEY", "JORDAN", "JOSEPH", "JUNGLE", "JUSTIZ", "KILLER", "KITTEN", "LABOUR", "LATEST", "LATTER", "LAUNCH", "LAWYER", "LEADER", "LEAGUE", "LEAVES", "LEGACY", "LENGTH", "LESSON", "LETTER", "LIGHTS", "LIKELY", "LINKED", "LISTEN", "LITTLE", "LIVING", "LOCATE", "LONDON", "LOVELY", "LOWEST", "LUXURY", "MAINLY", "MAKING", "MANAGE", "MANNER", "MANUAL", "MARKET", "MASTER", "MATTER", "MAYORS", "MEDIUM", "MEMBER", "MEMORY", "MENTAL", "MERELY", "METHOD", "MIDDLE", "MIDGET", "MINING", "MINUTE", "MIRROR", "MOBILE", "MODERN", "MODIFY", "MODULE", "MOMENT", "MORRIS", "MOSTLY", "MOTHER", "MOTION", "MOUNTS", "MOVING", "MURDER", "MUSCLE", "MUSEUM", "MUTUAL", "MYSELF", "NARROW", "NATION", "NATIVE", "NATURE", "NEARBY", "NEARLY", "NIGHTS", "NORMAL", "NOTICE", "NUMBER", "OBJECT", "OBTAIN", "OFFICE", "OFFSET", "ONLINE", "OPTION", "ORANGE", "ORDERS", "OUTPUT", "OXFORD", "PACKED", "POCKET", "POLICE", "POLICY", "POLLUX", "POSTER", "PREFIX", "PRETTY", "PRINCE", "PRISON", "PROFIT", "PROPER", "PROVEN", "PUBLIC", "PUNISH", "PURSUE", "PUZZLE", "QUARTZ", "RATHER", "READER", "REASON", "RECENT", "RECORD", "REDUCE", "REFORM", "REGARD", "REGINA", "REGION", "RELATE", "RELIEF", "REMAIN", "REMOTE", "REMOVE", "REPAIR", "REPEAT", "REPLAY", "REPORT", "RESCUE", "RESORT", "RESULT", "RETAIL", "RETAIN", "RETIRE", "RETURN", "REVEAL", "REVIEW", "REWARD", "RHYTHM", "RIBBON", "RIDING", "RISING", "ROBUST", "ROCKET", "ROLLER", "ROMANS", "ROSTER", "ROUGHLY", "RUBBER", "RULING", "SAFETY", "SALARY", "SAMPLE", "SAVING", "SCARCE", "SCHEME", "SCHOOL", "SCREEN", "SEARCH", "SEASON", "SECOND", "SECRET", "SECTOR", "SELECT", "SELLER", "SENIOR", "SERIES", "SERVER", "SETTLE", "SEVERE", "SEXUAL", "SHADOW", "SHARED", "SHEATH", "SHELLS", "SHIELD", "SHOULD", "SHOWED", "SIGNAL", "SILENT", "SILVER", "SIMPLY", "SINGLE", "SISTER", "SLEEPY", "SLIGHT", "SLOWLY", "SMOOTH", "SOCIAL", "SOUGHT", "SOURCE", "SOVIET", "SPEECH", "SPIRIT", "SPOKEN", "SPREAD", "SPRING", "SQUARE", "STABLE", "STATUS", "STEADY", "STOLEN", "STRAIN", "STREAM", "STREET", "STRESS", "STRICT", "STRIKE", "STRONG", "STUDIO", "SUBMIT", "SUDDEN", "SUFFER", "SUMMER", "SUMMIT", "SUPPLY", "SURELY", "SURVEY", "SWITCH", "SYMBOL", "SYSTEM", "TABLET", "TACKLE", "TALENT", "TARGET", "TAUGHT", "TENANT", "TENDER", "TENNIS", "THANKS", "THEORY", "THINGS", "THIRTY", "THOUGH", "THREAT", "THRILL", "THROWN", "TICKET", "TIMELY", "TIMING", "TOGETHER", "TOPICS", "TOWARD", "TRADER", "TRAVEL", "TREATY", "TRENDS", "TRIPLE", "TRUSTS", "TUNNEL", "TWELVE", "TWENTY", "UNABLE", "UNIQUE", "UNITED", "UNLESS", "UNLIKE", "UPDATE", "UPHOLD", "UPWARD", "URGENT", "USABLE", "USEFUL", "UTMOST", "VACANT", "VALLEY", "VARIED", "VECTOR", "VENDOR", "VESSEL", "VICTIM", "VISION", "VISUAL", "VOICES", "VOLUME", "WALKER", "WEALTH", "WEEKLY", "WEIGHT", "WHOLLY", "WINDOW", "WINNER", "WINTER", "WITHIN", "WONDER", "WORKER", "WRITER", "YELLOW"
  ],
  7: [
    "ABILITY", "BALANCE", "CAPTAIN", "DIAMOND", "ELEMENT", "FREEDOM", "GORILLA", "HARVEST", "IMAGINE", "JOURNEY", "KITCHEN", "LANTERN", "MESSAGE", "NETWORK", "OPTICAL", "PACKAGE", "QUALITY", "RAINBOW", "SCIENCE", "THOUGHT", "UNIFORM", "VICTORY", "WEATHER",
    "ABANDON", "ABDOMEN", "ABOLISH", "ABORTED", "ABSOLVE", "ABSORBE", "ABSTAIN", "ACADEMIC", "ACCOUNT", "ACHIEVE", "ACQUIRE", "ADDRESS", "ADJUSTS", "ADMIRAL", "ADULTLY", "ADVANCE", "ADVISOR", "AEROBIC", "AGAINST", "AIRLINE", "AIRPORT", "ALCOHOL", "ALLEGED", "ALREADY", "ALRIGHT", "AMATEUR", "AMAZING", "AMNESTY", "ANALYZE", "ANCIENT", "ANOTHER", "ANXIETY", "ANYBODY", "APPOINT", "APPROVE", "ARCHIVE", "AREASET", "ARRANGE", "ARRIVAL", "ARTICLE", "ASSAULT", "ASSEMBLY", "ASSUMES", "ATHLETE", "ATTEMPT", "ATTRACT", "AUCTION", "AVERAGE", "BACKING", "BANKING", "BARRIER", "BATTERY", "BEARING", "BEATING", "BECAUSE", "BEDROOM", "BELIEVE", "BENEATH", "BENEFIT", "BESIDES", "BETWEEN", "BILLION", "BINDING", "BLOSSOM", "BOOKING", "BRAVERY", "BREATHE", "BROUGHT", "BUILDER", "BURNING", "CABINET", "CALIBRE", "CALLING", "CAPABLE", "CAPITAL", "CAPTAIN", "CAPTURE", "CAREFUL", "CARTEL", "CASCADE", "CAUTION", "CEILING", "CENTRAL", "CENTURY", "CERTAIN", "CHAMBER", "CHANNEL", "CHAPTER", "CHARITY", "CHARLIE", "CHARTER", "CHECKED", "CHICKEN", "CHINESE", "CIRCUIT", "CLASSES", "CLASSIC", "CLEANER", "CLEARLY", "CLIMATE", "CLOSING", "COLLECT", "COLLEGE", "COMBINE", "COMFORT", "COMMAND", "COMMENT", "COMPACT", "COMPANY", "COMPARE", "COMPLEX", "CONCEPT", "CONCERN", "CONCERT", "CONDUCT", "CONFIRM", "CONNECT", "CONSENT", "CONSIST", "CONTACT", "CONTAIN", "CONTENT", "CONTEST", "CONTEXT", "CONTROL", "CONVERT", "COOKING", "CORRECT", "COUNCIL", "COUNSEL", "COUNTER", "COUNTRY", "COUPLES", "COURAGE", "CRUCIAL", "CRYSTAL", "CULTURE", "CURRENT", "CUTTING", "DANCING", "DARKNES", "DEALING", "DEFAULT", "DEFENSE", "DELIVER", "DENSITY", "DEPOSIT", "DESERVE", "DESKTOP", "DESTINY", "DESTROY", "DEVELOP", "DIAMOND", "DIGITAL", "DIGNITY", "DILEMMA", "DIRECTS", "DISABLE", "DISPLAY", "DISPUTE", "DISTANT", "DIVORCE", "DOCTINE", "DOCUMENT", "DOMAINS", "DRIVING", "DYNAMIC", "EASTERN", "ECONOMY", "EDITORS", "EFFECTS", "EFFORTS", "ELEMENT", "ELEVATE", "EMBASSY", "EMERGED", "EMOTION", "EMPATHY", "EMPRESS", "ENABLED", "ENEMIES", "ENGAGED", "ENGINEER", "ENGLISH", "ENHANCE", "ENORMOUS", "ENQUIRY", "ENTERED", "ENTIRELY", "ENTITLE", "EPISODE", "EQUALLY", "EVENING", "EVERYLY", "EVIDENT", "EXACTLY", "EXAMINE", "EXAMPLE", "EXCITED", "EXCLUDE", "EXHIBIT", "EXPENSE", "EXPLAIN", "EXPLORE", "EXPRESS", "EXTREME", "FACULTY", "FAILING", "FAILURE", "FASHION", "FEATURE", "FEDERAL", "FEEDING", "FEELING", "FICTION", "FIFTEEN", "FIGHTER", "FINALLY", "FINANCE", "FINDING", "FISHING", "FITNESS", "FLAVOUR", "FLEXIBLE", "FLOATING", "FLOWERS", "FOCUSED", "FOOTAGE", "FOREIGN", "FOREVER", "FORMULA", "FORTUNE", "FORWARD", "FOUNDER", "FREEDOM", "FRIENDS", "FUELING", "GALLERY", "GATEWAY", "GENERAL", "GENETIC", "GENUINE", "GIGANTIC", "GLACIER", "GLOSSARY", "GORILLA", "GRAVITY", "GREATER", "GROWING", "GUESTES", "GUIDING", "HABITAT", "HALFWAY", "HANDING", "HANGING", "HAPPILY", "HARBOUR", "HARVEST", "HEALTHY", "HEARING", "HEAVILY", "HELPFUL", "HEROINE", "HISTORY", "HOLDING", "HOLIDAY", "HOUSING", "HOWEVER", "HUNDRED", "HUSBAND", "ICEBERG", "IDEALLY", "IDENTIFY", "ILLNESS", "IMAGINE", "IMPROVE", "INCLUDE", "INDEXES", "INITIAL", "INSIGHT", "INSTALL", "INSTANT", "INSTEAD", "INSULIN", "INTEGER", "INTENSE", "INTERIM", "INVALID", "INVOLVE", "ISLANDS", "ISOLATE", "ITALIAN", "ITEMIZE", "JACKETS", "JANUARY", "JOURNAL", "JOURNEY", "JUSTICE", "KEEPING", "KINGDOM", "KITCHEN", "KNOWING", "LANTERN", "LANDING", "LARGELY", "LATINOS", "LAUGHED", "LAWSUIT", "LEADING", "LEARNED", "LEATHER", "LECTURE", "LEISURE", "LENDING", "LESBIAN", "LESSONS", "LIBERTY", "LIBRARY", "LICENSE", "LIMITED", "LISTING", "LITERAL", "LOOKING", "LOYALTY", "MACHINE", "MADNESS", "MAGICAL", "MAGNETS", "MAILBOX", "MAINTAIN", "MAJESTY", "MAJORLY", "MAKING", "MANAGED", "MANAGER", "MANDATE", "MARKETS", "MARRIED", "MASSIVE", "MAINTAIN", "MAJESTY", "MAJORLY", "MAKING", "MANAGED", "MANAGER", "MANDATE", "MARKETS", "MARRIED", "MASSIVE", "MASTERS", "MAXIMUM", "MEANING", "MEASURE", "MEDICAL", "MEETING", "MEMBERS", "MENTION", "MESSAGE", "METRICS", "MILLION", "MINERAL", "MINIMUM", "MISSING", "MISSION", "MISTAKE", "MIXTURE", "MODERNS", "MONITOR", "MONTHLY", "MORNING", "MUSICAL", "MYSTERY", "NATURAL", "NEARBY", "NEAREST", "NEITHER", "NETWORKS", "NEUTRAL", "NOTHING", "NOVELTY", "NUCLEAR", "NUMBERS", "OBJECTS", "OBSERVE", "OBVIOUS", "OFFENSE", "OFFICER", "ONGOING", "OPENING", "OPERATE", "OPINION", "OPTICAL", "OPTIMAL", "OPTIONS", "ORGANIC", "OUTCOME", "OUTSIDE", "OVERALL", "PACKAGE", "PAINFUL", "PAINTER", "PARKING", "PARTIAL", "PASSAGE", "PASSIVE", "PATIENT", "PATTERN", "PAYMENT", "PENDING", "PERFECT", "PERFORM", "PHANTOM", "PHOENIX", "PHYSICS", "PIONEER", "PLANNED", "PLASTIC", "PLAYING", "POPULAR", "PORTION", "POVERTY", "PRECISE", "PREDICT", "PREMIER", "PREPARE", "PRESENT", "PREVENT", "PRIMARY", "PRINTER", "PRIVACY", "PRIVATE", "PROBLEM", "PROCEED", "PROCESS", "PRODUCE", "PRODUCT", "PROFILE", "PROGRAM", "PROJECT", "PROMISE", "PROMOTE", "PROPOSE", "PROTECT", "PROUDLY", "PROVIDE", "PUZZLED", "QUALITY", "QUARTER", "QUEUING", "QUIETLY", "RADICAL", "RAILWAY", "RAINBOW", "RANGING", "RAPIDLY", "REALITY", "REBUILD", "RECEIVE", "RECORDS", "RECOVER", "RECRUIT", "REFLECT", "REFORMS", "REFUSAL", "REGARDS", "REGULAR", "RELATED", "RELEASE", "RELIANT", "RELIERS", "REMAINS", "REMOVAL", "REPORTS", "REQUEST", "REQUIRE", "RESERVE", "RESOLVE", "RESPECT", "RESPOND", "RESTORE", "RESULTS", "RETIREE", "REVENUE", "REVERSE", "REVIEWS", "ROUTINE", "RUNNING", "SAILING", "SAMPLES", "SAVINGS", "SCENERY", "SCIENCE", "SCOOTER", "SCRATCH", "SCREENS", "SECTION", "SEGMENT", "SELECTS", "SELLING", "SENDING", "SENSORS", "SERIOUS", "SERVANT", "SERVICE", "SESSION", "SETTING", "SEVENTY", "SHARING", "SHELTER", "SHERIFF", "SHINING", "SHIPPED", "SHOWING", "SIGNALS", "SILENCE", "SIMILAR", "SINGING", "SIXTEEN", "SKILLED", "SMOKING", "SOCIETY", "SOLDIER", "SOMETHS", "SORTING", "SOURCES", "SPEAKER", "SPECIAL", "SPECIES", "SPECTRE", "SPENCER", "SPINACH", "SPONSOR", "STADIUM", "STAGING", "STATION", "STATUTE", "STAYING", "STORAGE", "STORMED", "STRANGE", "STREAMS", "STRETCH", "STUDENT", "STUDIED", "SUBJECT", "SUCCESS", "SUGGEST", "SUMMARY", "SUNRISE", "SUPPORT", "SURFACE", "SURGERY", "SURVIVE", "SUSPECT", "SYMBOLS", "SYMPTOM", "TACTICS", "TALKING", "TEACHER", "TELLING", "TENSION", "TERMINS", "TEXTURE", "THEATRE", "THERAPY", "THROUGH", "TICKETS", "TITANIC", "TONIGHT", "TOPICAL", "TORONTO", "TOTALED", "TOWARDS", "TRAGEDY", "TRAINED", "TRAINER", "TREASUR", "TROUBLE", "TRUSTED", "TUNNELS", "TURKISH", "TWELVE", "TYPICAL", "UNIFORM", "UNKNOWN", "UNUSUAL", "UPDATING", "URGENCY", "UTILITY", "VACCINE", "VAGUELY", "VALUING", "VARIOUS", "VEHICLE", "VENTURE", "VERSION", "VETERAN", "VICTIMS", "VICTORY", "VILLAGE", "VIOLATE", "VIOLENT", "VIRTUAL", "VISIBLE", "VISIONS", "VISITED", "VISITOR", "VITALITY", "VOLTAGE", "WAITING", "WALKING", "WANTEDLY", "WARRANT", "WASHING", "WATCHES", "WEAPONS", "WEATHER", "WEAVING", "WEBSITE", "WEDDING", "WEEKEND", "WELCOME", "WELFARE", "WESTERN", "WHEREAS", "WHETHER", "WHISPER", "WHOEVER", "WINDOWS", "WINNING", "WITHOUT", "WITNESS", "WORKING", "WORKOUT", "WRITING", "WRITTEN", "YOUTUBE", "ZEROING"
  ],
  8: [
    "ABSOLUTE", "BUILDING", "COMPUTER", "DAUGHTER", "ELEPHANT", "FESTIVAL", "GRADIENT", "HOLIDAYS", "IDENTITY", "JUNCTION", "KEYBOARD", "LANGUAGE", "MOUNTAIN", "NOTEBOOK", "OPTIONAL", "PAINTING", "QUESTION", "RELIABLE", "SUNLIGHT", "TOGETHER", "UMBRELLA", "VACATION",
    "ABORTION", "ABSOLUTE", "ABSTRACT", "ACADEMIC", "ACCEPTED", "ACCIDENT", "ACCURACY", "ACCURATE", "ACHIEVED", "ACQUIRED", "ACTIVITY", "ACTUALLY", "ADDITION", "ADEQUATE", "ADJACENT", "ADJUSTED", "ADVANCED", "ADVISORY", "ADVOCATE", "AFFECTED", "AFFORDED", "AIRCRAFT", "AIRLINES", "ALLIANCE", "ALTHOUGH", "ALUMINUM", "AMERICAN", "ANALYSIS", "ANCESTOR", "ANNOUNCE", "ANNUALLY", "ANYTHING", "APPARENT", "APPEARED", "APPENDIX", "APPROACH", "APPROVAL", "APPROVED", "ARGUMENT", "ARRIVING", "ARTISTIC", "ASSEMBLY", "ASSERTED", "ASSESSOR", "ASSIGNED", "ASSISTED", "ASSUMEED", "ASSURING", "ATHLETIC", "ATTACHED", "ATTACKED", "ATTEMPTD", "ATTENDED", "ATTITUDE", "ATTRACTS", "AUDIENCE", "AUTUMNUS", "BARBADOS", "BARRIERS", "BASELINE", "BECOMING", "BEDROOMS", "BEGINNER", "BEHAVIOR", "BELIEVED", "BENEFITS", "BERKELEY", "BETRAYAL", "BEVERAGE", "BOUNDARY", "BREAKING", "BREATHES", "BRINGING", "BROADWAY", "BUILDERS", "BUILDING", "BUSINESS", "CALENDAR", "CAMPAIGN", "CAPACITY", "CAPITALO", "CAPTURED", "CAREFULL", "CAROLINA", "CARRYING", "CATEGORY", "CAUCASUS", "CHAIRMAN", "CHAMPION", "CHANNELS", "CHAPTERS", "CHEMICAL", "CHILDREN", "CHOOSING", "CHRONICL", "CIRCUITS", "CITATION", "CIVILIAN", "CLEANING", "CLINICAL", "COLLECTS", "COLLEGES", "COLONIAL", "COLORADO", "COLUMBIA", "COMBINED", "COMMENTS", "COMMERCE", "COMPACTS", "COMPANIA", "COMPETES", "COMPILER", "COMPLETE", "COMPUTED", "COMPUTER", "CONCLUDE", "CONCRETE", "CONFLICT", "CONFUSED", "CONGRESS", "CONSIDER", "CONSTANT", "CONSUMER", "CONTINUE", "CONTRACT", "CONTRARY", "CONTROLS", "CONVEXES", "CONVINCE", "COOLIDGE", "COPIERED", "COPYINGS", "CORPORAT", "CORRECTO", "COUNCILS", "COUNSELS", "COUNTING", "COUNTRIES", "COURAGEO", "COVERAGE", "COVERING", "CREATING", "CREATIVE", "CRITICAL", "CULTURAL", "CURRENCY", "DATABASE", "DAUGHTER", "DAYLIGHT", "DEADLINE", "DECIDEDD", "DECISION", "DECLINES", "DECORATE", "DECREASE", "DEDICATE", "DEFAULTS", "DEFERRED", "DEFINING", "DELEGATE", "DELICATE", "DELIVERY", "DEMONSTR", "DEPOSITS", "DESCRIPT", "DESERVES", "DESIGNED", "DESIGNER", "DESKTOPD", "DETAILED", "DETECTED", "DETERMIN", "DEVELOPD", "DIABETES", "DIAGNOSE", "DIAGONAL", "DIALOGUE", "DIAMONDS", "DIFFERSO", "DIFFUSED", "DIGITALE", "DIRECTLY", "DIRECTOR", "DISABLED", "DISASTER", "DISCLOSE", "DISCOUNT", "DISCOURS", "DISCOVER", "DISCRETE", "DISEASES", "DISPLAYS", "DISTANCE", "DISTINCT", "DISTRICT", "DIVIDEND", "DIVISION", "DOCTRINE", "DOCUMENT", "DOMESTIC", "DOMINANT", "DONATING", "DOUBTERS", "DRAMATIC", "DRAWINGS", "DRINKING", "DRIVINGO", "DYNAMICS", "EARNINGS", "ECONOMIC", "EDITIONO", "EDITINGS", "EDUCATOR", "EFFECTED", "EFFICACY", "EIGHTEEN", "EIGHTIES", "ELECTION", "ELECTRIC", "ELEGANCE", "ELEMENTO", "ELEPHANT", "ELIGIBLE", "EMISSION", "EMOTIONO", "EMPHASIS", "EMPLOYED", "EMPLOYEE", "EMPLOYER", "ENABLING", "ENEMIESO", "ENERGYED", "ENGAGING", "ENGINEER", "ENHANCED", "ENJOYING", "ENORMOUS", "ENROLLED", "ENTERING", "ENTIRELY", "ENTITLED", "ENTRANCE", "ENVELOPE", "EPISODES", "EQUALLED", "EQUATION", "EQUITABL", "ESTIMATE", "EUROPEAN", "EVALUATE", "EVERYDAY", "EVERYONE", "EVIDENCE", "EXAMINED", "EXAMPLES", "EXCELLNT", "EXCEPTED", "EXCHANGE", "EXCITEDD", "EXCLUDES", "EXECUTED", "EXERCISE", "EXHIBITS", "EXISTING", "EXPANDED", "EXPECTED", "EXPENSES", "EXPERIENCE", "EXPERIMENT", "EXPLAINO", "EXPLICIT", "EXPLOREED", "EXPOSURE", "EXTERNAL", "EYEBROWS", "FACILITY", "FACTORS", "FALLINGO", "FAMILIAR", "FEATURES", "FEBRUARY", "FEDERALE", "FEEDBACK", "FESTIVAL", "FIGHTERS", "FIGHTING", "FIGURES", "FINALLYO", "FINANCES", "FINISHED", "FIREWALL", "FIRSTLYO", "FITTINGS", "FIXTURES", "FLAVOURS", "FLEXIBLE", "FLOATING", "FLOWERSO", "FOLLOWED", "FOOTBALL", "FOOTFALL", "FORBIDDN", "FORCEFUL", "FORECAST", "FOREIGNER", "FOREMOST", "FOREVIEW", "FOREWORK", "FORMULAS", "FORTUNES", "FORWARDED", "FOUNDERS", "FRACTION", "FRAGMENT", "FREEWARE", "FREQUENT", "FRIENDLY", "FRONTAGE", "FRONTIER", "FUNCTION", "FURTHERO", "GARDENER", "GATHERED", "GENTLEMA", "GENUINEO", "GEOMETRY", "GERMANYO", "GESTURES", "GIGANTIC", "GLOSSARY", "GOVERNOR", "GRADIENT", "GRAPHICS", "GREATERS", "GROUPING", "GUIDANCE", "HANDLING", "HANGINGS", "HAPPENED", "HARDWARE", "HARVESTS", "HEADLINE", "HEALTHY", "HERITAGE", "HIGHLYED", "HIGHWAYS", "HISTORIE", "HOLDINGS", "HOLIDAYS", "HOMELESS", "HORIZONTAL", "HOSPITAL", "HOUSEHOLD", "HUNGARYA", "IDENTIFY", "IDENTITY", "IDEOLOGY", "ILLUSION", "IMAGINEE", "IMMATURA", "IMMEDIAT", "IMMORTAL", "IMPULSES", "INCLUDED", "INCLUDES", "INCREASE", "INDEXING", "INDICATE", "INDIRECT", "INFINITY", "INFORMED", "INHERITS", "INITIALO", "INITIATE", "INNERWAY", "INNOCENT", "INSIGHTS", "INSTALLED", "INSTANCE", "INSTITUT", "INSULATE", "INSURANC", "INTEGERS", "INTERNAL", "INTERVAL", "INTIMACY", "INVALIDO", "INVASION", "INVESTED", "INVINCIB", "INVOLVED", "ISOLATED", "ISSUANCE", "ITEMIZED", "JACKSONS", "JAPANESE", "JOURNALS", "JOURNEYO", "JUDICIAL", "JUNCTION", "JUPITERS", "KEYWORDS", "KINETICS", "KINGDOMS", "KITCHENS", "KNOWLEDGE", "LANGUAGE", "LARGELYD", "LEARNING", "LECTURES", "LEGENDAS", "LIBERTIE", "LIBRARIES", "LICENSES", "LIGHTING", "LIKEWISE", "LIMITING", "LISTENED", "LITERACY", "LITERARY", "LOCATION", "LOGISTIC", "LONG-TERM", "LOYALTIES", "MACHINES", "MAGAZINE", "MAGNETIC", "MAINTAIN", "MAJORITY", "MANAGERS", "MANAGING", "MANDATES", "MANURING", "MARGINAL", "MARKETER", "MARKINGS", "MARRIAGE", "MATERIAL", "MATHEMAT", "MEASURED", "MEASURES", "MECHANIC", "MEDICINE", "MEETINGS", "MEMBRANE", "MEMORIES", "MENTIONO", "MESSAGES", "METADATA", "METHODS", "MILITARY", "MINERALS", "MINIMIZE", "MINISTRY", "MINORITY", "MISSILES", "MISSIONS", "MISTAKED", "MIXTURES", "MODALISM", "MODERATO", "MODIFIED", "MOMENTUM", "MONETARY", "MONTANAS", "MONUMENT", "MORNINGS", "MOUNTAIN", "MOVEMENT", "MULTIPLY", "MUSICALS", "MUTUALLY", "MYSTERIES", "NATIONAL", "NATURALS", "NEGATIVE", "NETWORKS", "NEUTRALS", "NICARAGU", "NORTHERN", "NOTEBOOK", "NOVEMBER", "NUCLEARO", "NUMERICS", "OBEDIENT", "OBJECTED", "OBSCURED", "OBSERVED", "OBSTACLE", "OBTAINED", "OFFENSES", "OFFICERS", "OFFICIAL", "OPERATED", "OPERATOR", "OPINIONS", "OPPOSING", "OPPOSITE", "OPTIONAL", "ORDINARY", "ORGANING", "ORIENTAL", "ORIGINAL", "OSCILLAT", "OUTCOMES", "OUTLINED", "OVERHEAD", "PACIFICS", "PACKAGES", "PAINFULLY", "PAINTING", "PARALLEL", "PARENTSA", "PARTICLE", "PASSPORT", "PATIENCE", "PATIENTS", "PATTERNS", "PAYMENTS", "PEACEFUL", "PERCEIVE", "PERCENTA", "PERFORMS", "PERIODIC", "PERSONAE", "PERSONAL", "PHANTOMS", "PHOENIXS", "PHRASING", "PHYSICAL", "PHYSICSO", "PICNICKS", "PICTURES", "PIONEERS", "PIPELINE", "PLACEMEN", "PLATFORM", "PLEASURE", "POLICIES", "POLITICS", "PORTIONS", "POSITION", "POSITIVE", "POSSIBLE", "POWERFUL", "PRACTICE", "PRECIOUS", "PRECISELY", "PREDICAT", "PREMISES", "PREPARED", "PRESENCE", "PRESENTO", "PRESERVE", "PRESSURE", "PREVIOUS", "PRIMITIV", "PRINCIPL", "PRIORITY", "PRISONER", "PROBABLY", "PROCEEDS", "PRODUCER", "PROGRESS", "PROJECTS", "PROMPTLY", "PROPERLY", "PROPERTY", "PROPOSAL", "PROPOSED", "PROTOCOL", "PROVIDED", "PROVIDER", "PUBLICLY", "PURCHASE", "PURSUING", "QUANTITY", "QUESTION", "REACTION", "READINGS", "REALIZED", "REASONAB", "RECENTLY", "RECOVERY", "REDUCING", "REFERRED", "REFINERY", "REFLECTS", "REGIONAL", "REGISTER", "REGULATE", "REJECTED", "RELATION", "RELATIVE", "RELEASED", "RELIABLE", "REMEMBER", "REMOTELY", "REMOVALS", "RENEWALS", "REPORTED", "REPUBLIC", "REQUESTS", "REQUIRED", "RESEARCH", "RESERVED", "RESIDENT", "RESPONSE", "RESTORING", "RETAINED", "REVENUES", "REVERTED", "REVIEWED", "REVISION", "REWARDED", "RHYTHMIC", "ROUTINES", "SAMPLING", "SATURDAY", "SCAREDLY", "SCENARIO", "SCHEDULE", "SOCIETAL", "SOLUTIONS", "SPECIFIC", "STANDARD", "STANDING", "STARTING", "STATEMEN", "STATUTES", "STEERING", "STRATEGY", "STRENGTH", "STRONGLY", "STUDENTS", "STUDYING", "SUITABLE", "SUPERIOR", "SUPPORTS", "SURGERY", "SURPRISI", "SURROUND", "SWIMMING", "SYMBOLIC", "TABLETSA", "TACTICAL", "TEACHERS", "TEACHING", "TELNETED", "TEMPLATE", "TENDENCY", "TERMINAL", "THINKING", "THIRTEEN", "THOROUGH", "THURSDAY", "TIMELINE", "TITANIUM", "TOGETHER", "TOLERANC", "TOMORROW", "TRACKING", "TRAINING", "TRANFERD", "TRANSFER", "TRAVELED", "TREASURY", "TRIANGLE", "TRIGGERT", "TRIUMPHS", "TROPICAL", "TROUBLES", "TURNAROU", "TYPICALL", "ULTIMATE", "UMBRELLA", "UNIVERSE", "VARIABLE", "VARIANCE", "VARIANTS", "VERTICAL", "VETERANS", "VIBRANCY", "VICINITY", "VICTORIA", "VIRGINIA", "VISITING", "VOLCANIC", "VOLUMINA", "VOUCHERS", "WARRANTY", "WATCHING", "WAVELENG", "WOODWORK", "WORKSHOP"
  ]
};

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  // Game State
  let targetWord = "";
  let guesses: any[] = [];
  let status = "IDLE"; // IDLE, PLAYING, WON, LOST
  let currentVotes: Record<string, Set<string>> = {};
  let voteOrder: string[] = []; // Track which words were voted for first
  let timeLeft = 0;
  let delayLeft = 0;
  let resetTimeLeft = 0;
  let timerInterval: NodeJS.Timeout | null = null;
  let tiktokConnection: WebcastPushConnection | null = null;
  
  let currentWordLength = 5;
  let streak = 0;
  let totalStreak = 0;
  let endlessStreak = 0;
  let isEndlessMode = false;
  let lastWinningWord = "";
  let roundTimerDuration = 30;
  let pendingTimerDuration = 30;

  // Filter dictionary to create a pool of suitable target words
  const targetPool: Record<number, string[]> = {};
  
  const exceptionsEndingInS = new Set([
    "GLASS", "GRASS", "CLASS", "CHESS", "PRESS", "STRESS", "STATUS", "FOCUS", "DRESS", "GROSS", "CRISIS", "LENS", "MASS", "LOSS", "BOSS", "CROSS", "BLISS", "GUESS", "MESS", "LESS", "ROSS", "MISS", "KISS", "PASS", "PLUS", "BONUS", "MINUS", "VIRUS", "ABYSS", "CANVAS", "SERIES", "SPECIES"
  ]);

  const properNouns = new Set([
     "CHINA", "HENRY", "JAPAN", "JONES", "LAURA", "PETER", "SIMON", "SMITH", "TERRY", "MARCH", "AUGUST",
     "BERLIN", "EUROPE", "FRENCH", "GERMAN", "GREECE", "LONDON", "OXFORD", "REGINA", "ROMANS", "YOUTUBE",
     "TORONTO", "CHINESE", "ITALIAN", "JANUARY", "JACKSONS", "JAPANESE", "JUPITERS", "MONTANAS",
     "NICARAGU", "PACIFICS", "SATURDAY", "THURSDAY", "VICTORIA", "VIRGINIA", "JORDAN", "JOSEPH", "JERSEY",
     "GRAHAM", "POLLUX", "MORRIS"
  ]);

  Object.entries(dictionary).forEach(([len, words]) => {
    const length = parseInt(len);
    targetPool[length] = words.filter(word => {
      // 1. Remove Proper Nouns
      if (properNouns.has(word)) return false;

      // 2. Remove Regular Past Tense ending in -ED
      if (word.endsWith("ED") && word.length > 3) return false;

      // 3. Remove Plurals ending in -S or -ES
      if (word.endsWith("S") && !exceptionsEndingInS.has(word)) return false;

      return true;
    });
  });

  // Backups for streak save
  let prevStreak = 0;
  let prevTotalStreak = 0;
  let prevEndlessStreak = 0;
  let saviorInfo: any = null;
  let resetTimeout: NodeJS.Timeout | null = null;

  function resetGame() {
    // Apply pending timer duration
    roundTimerDuration = pendingTimerDuration;

    if (isEndlessMode) {
      currentWordLength = 5;
    } else {
      // Increase difficulty if streak reached threshold
      if (streak >= 5) {
        streak = 0;
        currentWordLength++;
        if (currentWordLength > 8) currentWordLength = 5;
      }
    }

    const words = targetPool[currentWordLength] || dictionary[currentWordLength];
    targetWord = words[Math.floor(Math.random() * words.length)];
    guesses = [];

    // Continuous chain in endless mode: auto-guess the last winning word
    if (isEndlessMode && lastWinningWord && lastWinningWord.length === currentWordLength) {
      const result = checkWord(lastWinningWord, targetWord);
      guesses.push({ word: lastWinningWord, result });
    }

    status = "PLAYING";
    currentVotes = {};
    voteOrder = [];
    timeLeft = roundTimerDuration;
    delayLeft = 3;
    resetTimeLeft = 0;
    startTimer();
    broadcastState();
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (delayLeft > 0) {
        delayLeft = Math.max(0, delayLeft - 0.1);
        broadcastState();
        return;
      }

      if (status === "PLAYING") {
        if (timeLeft > 0) {
          timeLeft = Math.max(0, timeLeft - 0.1);
          broadcastState();
        } else {
          processVotes();
        }
      } else if (status === "CELEBRATING" || status === "DEFEATED") {
        if (resetTimeLeft > 0) {
          resetTimeLeft = Math.max(0, resetTimeLeft - 0.1);
          broadcastState();
        }
      }
    }, 100);
  }

  function processVotes() {
    const voteEntries = Object.entries(currentVotes)
      .map(([word, voters]) => ({ word, count: voters.size }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        // Tie-breaker: Which word received its first vote earliest
        return voteOrder.indexOf(a.word) - voteOrder.indexOf(b.word);
      });

    if (voteEntries.length > 0) {
      addGuess(voteEntries[0].word);
    } else {
      // No votes, just restart the timer
      timeLeft = roundTimerDuration;
      delayLeft = 3;
    }
    currentVotes = {};
    voteOrder = [];
    broadcastState();
  }

  function addGuess(word: string) {
    if (status !== "PLAYING") return;

    const result = checkWord(word, targetWord);
    guesses.push({ word, result });

    if (word === targetWord) {
      status = "WON";
      streak++;
      totalStreak++;
      if (isEndlessMode) {
        endlessStreak++;
        lastWinningWord = targetWord;
      }
      
      // Keep WON for tumble, then splash
      setTimeout(() => {
        status = "CELEBRATING";
        resetTimeLeft = 10;
        broadcastState();
        
        setTimeout(() => {
          resetGame();
        }, 10000);
      }, 2000);
    } else if (guesses.length >= 5) {
      status = "LOST";
      
      // Backup for streak save
      prevStreak = streak;
      prevTotalStreak = totalStreak;
      prevEndlessStreak = endlessStreak;

      streak = 0;
      totalStreak = 0;
      if (isEndlessMode) {
        endlessStreak = 0;
        lastWinningWord = "";
      }

      // Transition to disappointing splash for tumble
      setTimeout(() => {
        if (status !== "LOST") return; // Might have been saved
        status = "DEFEATED";
        resetTimeLeft = 60;
        broadcastState();

        resetTimeout = setTimeout(() => {
          if (status === "DEFEATED") resetGame();
        }, 60000);
      }, 2000);
    } else {
      timeLeft = roundTimerDuration; 
      delayLeft = 3;
    }
  }

  function checkWord(guess: string, target: string) {
    const len = target.length;
    const result = new Array(len).fill("absent");
    const targetArr = target.split("");
    const guessArr = guess.split("");

    // First pass: Correct positions
    for (let i = 0; i < len; i++) {
      if (guessArr[i] === targetArr[i]) {
        result[i] = "correct";
        targetArr[i] = "";
        guessArr[i] = "";
      }
    }

    // Second pass: Misplaced
    for (let i = 0; i < len; i++) {
      if (guessArr[i] !== "" && targetArr.includes(guessArr[i])) {
        result[i] = "present";
        targetArr[targetArr.indexOf(guessArr[i])] = "";
      }
    }

    return result;
  }

  function broadcastState() {
    const hiddenWord = targetWord ? targetWord[0] + "*".repeat(Math.max(0, targetWord.length - 1)) : "";
    
    const voteEntries = Object.entries(currentVotes)
      .map(([word, voters]) => ({ word, count: voters.size }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return voteOrder.indexOf(a.word) - voteOrder.indexOf(b.word);
      });

    io.emit("game_state", {
      targetWord: (status === "WON" || status === "LOST" || status === "CELEBRATING" || status === "DEFEATED" || status === "SAVED") ? targetWord : hiddenWord,
      wordLength: currentWordLength,
      streak,
      totalStreak,
      endlessStreak,
      isEndlessMode,
      roundTimerDuration: pendingTimerDuration, // UI shows what's selected
      activeTimerDuration: roundTimerDuration, // Actual timer bar uses this
      guesses,
      status,
      timeLeft,
      delayLeft,
      resetTimeLeft,
      saviorInfo,
      voteCount: voteEntries.reduce((a, b) => a + b.count, 0),
      topVotes: voteEntries.slice(0, 5),
    });
  }

  io.on("connection", (socket) => {
    console.log("Client connected");
    broadcastState();

    socket.on("start_game", () => {
      resetGame();
    });

    socket.on("connect_tiktok", (username) => {
      if (tiktokConnection) {
        tiktokConnection.disconnect();
      }

      console.log(`Connecting to TikTok user: ${username}`);
      tiktokConnection = new WebcastPushConnection(username);

      tiktokConnection.connect().then(state => {
        console.log(`Connected to room ${state.roomId}`);
        socket.emit("tiktok_connected", username);
      }).catch(err => {
        console.error("Failed to connect", err);
        socket.emit("tiktok_error", err.message);
      });

      tiktokConnection.on("chat", (data) => {
        const message = data.comment.toUpperCase().trim();
        
        // Broadcast the raw chat message for the feed
        io.emit("tiktok_chat", {
          uniqueId: data.uniqueId,
          nickname: data.nickname,
          profilePictureUrl: data.profilePictureUrl,
          comment: data.comment
        });

        processGuess(message, data.uniqueId);
      });

      tiktokConnection.on("gift", (data) => {
        if (data.diamondCount >= 199 && (status === "LOST" || status === "DEFEATED")) {
          handleStreakSave({
            name: data.nickname,
            profilePictureUrl: data.profilePictureUrl,
            giftName: data.giftName,
            giftPictureUrl: data.giftPictureUrl?.replace("_100x100.webp", "_large.png") || ""
          });
        }
      });
    });

    function handleStreakSave(info: any) {
      if (resetTimeout) clearTimeout(resetTimeout);
      status = "SAVED";
      saviorInfo = info;
      
      // Restore streaks
      streak = prevStreak;
      totalStreak = prevTotalStreak;
      endlessStreak = prevEndlessStreak;
      
      broadcastState();
      
      setTimeout(() => {
        saviorInfo = null;
        resetGame();
      }, 7000);
    }

    socket.on("test_guess", (word: string) => {
      const message = word.toUpperCase().trim();
      processGuess(message, socket.id);
    });

    socket.on("debug_win", () => {
      if (status === "PLAYING" && targetWord) {
        addGuess(targetWord);
      }
    });

    socket.on("debug_loss", () => {
      if (status === "PLAYING") {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        // Fill up to 4 guesses with wrong words
        while (guesses.length < 4) {
          let dummy = "";
          for(let i=0; i<currentWordLength; i++) {
            dummy += alphabet[Math.floor(Math.random() * alphabet.length)];
          }
          if (dummy !== targetWord) addGuess(dummy);
        }
        // Last one also wrong
        let lastDummy = "";
        for(let i=0; i<currentWordLength; i++) {
          lastDummy += alphabet[Math.floor(Math.random() * alphabet.length)];
        }
        if (lastDummy === targetWord) lastDummy = alphabet[0].repeat(currentWordLength);
        addGuess(lastDummy);
      }
    });

    socket.on("simulate_streak_save", () => {
      if (status === "LOST" || status === "DEFEATED") {
        handleStreakSave({
          name: "TikTok Legend",
          profilePictureUrl: "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/7339247348981448709~c5_100x100.webp?lk3s=a5d48d8d&x-expires=1714532400&x-signature=8B9fF7%2Fj%2Bw9%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2Bw%3D",
          giftName: "TikTok Universe",
          giftPictureUrl: "https://p16-webcast.tiktokcdn.com/img/maliva/webcast/5f8b9e6e4f3a7f8e8e8e8e8e8e8e8e8e~tplv-obj:100:100.webp"
        });
      }
    });

    socket.on("set_timer_duration", (duration: number) => {
      pendingTimerDuration = duration;
      broadcastState();
    });

    socket.on("toggle_endless_mode", () => {
      isEndlessMode = !isEndlessMode;
      if (isEndlessMode) {
        currentWordLength = 5;
        streak = 0;
        lastWinningWord = "";
        endlessStreak = 0;
      }
      broadcastState();
    });

    function processGuess(message: string, userId: string) {
      // Normalize: remove "FOR FILLER" if present and trim
      let processed = message.replace(/\bFOR FILLER\b/gi, "").trim();

      // Check if it's a single word (no spaces) and valid length
      if (processed.includes(" ")) return; 
      
      if (processed.length === currentWordLength && /^[A-Z]+$/.test(processed)) {
        if (!currentVotes[processed]) {
          currentVotes[processed] = new Set();
          voteOrder.push(processed); // Track first occurrence
        }
        currentVotes[processed].add(userId);
        broadcastState();
      }
    }

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

export interface Emoji {
  char: string
  /** What it shows, in words: read out by screen readers and matched by the search box. */
  name: string
}

export interface EmojiCategory {
  name: string
  emoji: readonly Emoji[]
}

const list = (text: string): Emoji[] =>
  text.split('|').map((entry) => {
    const space = entry.indexOf(' ')
    return { char: entry.slice(0, space), name: entry.slice(space + 1) }
  })

/**
 * A few hundred of the most used emoji, in the usual groups. Each entry is the emoji, a space and its name.
 * Add to the lists, or pass your own categories to the picker.
 */
export const emojiCategories: readonly EmojiCategory[] = [
  {
    name: 'Smileys',
    emoji: list('😀 grinning face|😃 smiling face with big eyes|😄 smiling face with smiling eyes|😁 beaming face|😆 squinting face|😅 grinning face with sweat|🤣 rolling on the floor laughing|😂 face with tears of joy|🙂 slightly smiling face|🙃 upside-down face|😉 winking face|😊 smiling face with blush|😇 smiling face with halo|🥰 smiling face with hearts|😍 heart eyes|🤩 star-struck|😘 face blowing a kiss|😋 face savouring food|😛 face with tongue|😜 winking face with tongue|🤪 zany face|🤔 thinking face|🤨 face with raised eyebrow|😐 neutral face|😑 expressionless face|😶 face without mouth|😏 smirking face|😒 unamused face|🙄 face with rolling eyes|😬 grimacing face|😌 relieved face|😔 pensive face|😴 sleeping face|😷 face with medical mask|🤒 face with thermometer|🥵 hot face|🥶 cold face|😵 dizzy face|🤯 exploding head|🥳 partying face|😎 smiling face with sunglasses|🤓 nerd face|😕 confused face|😟 worried face|😮 face with open mouth|😳 flushed face|🥺 pleading face|😢 crying face|😭 loudly crying face|😱 face screaming in fear|😤 face with steam from nose|😡 pouting face|😠 angry face|🤬 face with symbols on mouth|💀 skull|👻 ghost|🤖 robot|💩 pile of poo'),
  },
  {
    name: 'People',
    emoji: list('👋 waving hand|✋ raised hand|👌 OK hand|✌️ victory hand|🤞 crossed fingers|🤟 love-you gesture|🤘 sign of the horns|👈 pointing left|👉 pointing right|👆 pointing up|👇 pointing down|👍 thumbs up|👎 thumbs down|✊ raised fist|👊 oncoming fist|👏 clapping hands|🙌 raising hands|🤝 handshake|🙏 folded hands|✍️ writing hand|💪 flexed biceps|👀 eyes|🧠 brain|👶 baby|🧑 person|👩 woman|👨 man|🧓 older person|🙋 person raising hand|🤷 person shrugging|🤦 person facepalming|🙅 person gesturing no|🙆 person gesturing OK|💃 woman dancing|🕺 man dancing|🏃 person running|🚶 person walking|👪 family'),
  },
  {
    name: 'Nature',
    emoji: list('🐶 dog|🐱 cat|🐭 mouse|🐹 hamster|🐰 rabbit|🦊 fox|🐻 bear|🐼 panda|🐨 koala|🐯 tiger|🦁 lion|🐮 cow|🐷 pig|🐸 frog|🐵 monkey|🐔 chicken|🐧 penguin|🐦 bird|🦆 duck|🦉 owl|🐴 horse|🦄 unicorn|🐝 honeybee|🦋 butterfly|🐢 turtle|🐍 snake|🐙 octopus|🐬 dolphin|🐳 whale|🐟 fish|🌵 cactus|🌲 evergreen tree|🌳 deciduous tree|🌴 palm tree|🌱 seedling|🍀 four leaf clover|🌷 tulip|🌹 rose|🌻 sunflower|🌸 cherry blossom|☀️ sun|🌙 crescent moon|⭐ star|🌈 rainbow|☁️ cloud|🌧️ cloud with rain|⚡ lightning|❄️ snowflake|🔥 fire|💧 droplet|🌊 water wave'),
  },
  {
    name: 'Food',
    emoji: list('🍎 red apple|🍊 tangerine|🍋 lemon|🍌 banana|🍉 watermelon|🍇 grapes|🍓 strawberry|🍒 cherries|🍑 peach|🍍 pineapple|🥑 avocado|🍅 tomato|🥕 carrot|🌽 corn|🥦 broccoli|🍞 bread|🥐 croissant|🧀 cheese|🥚 egg|🥓 bacon|🍔 hamburger|🍟 french fries|🍕 pizza|🌭 hot dog|🌮 taco|🌯 burrito|🍜 steaming bowl|🍝 spaghetti|🍣 sushi|🍚 cooked rice|🥗 green salad|🍿 popcorn|🍩 doughnut|🍪 cookie|🎂 birthday cake|🍰 shortcake|🍫 chocolate bar|🍦 ice cream|☕ hot beverage|🍵 tea|🥤 cup with straw|🍺 beer|🍷 wine glass|🥂 clinking glasses|🍸 cocktail'),
  },
  {
    name: 'Activities',
    emoji: list('⚽ football|🏀 basketball|🏈 american football|⚾ baseball|🎾 tennis|🏐 volleyball|🏓 table tennis|⛳ golf|🏊 person swimming|🚴 person cycling|🏋️ person lifting weights|🧘 person in lotus position|🎮 video game|🎲 game die|♟️ chess pawn|🎯 bullseye|🎳 bowling|🎨 artist palette|🎬 clapper board|🎤 microphone|🎧 headphone|🎸 guitar|🎹 piano|🥁 drum|🎻 violin|🎉 party popper|🎊 confetti ball|🎈 balloon|🎁 wrapped gift|🏆 trophy|🥇 gold medal|🎟️ admission tickets'),
  },
  {
    name: 'Travel',
    emoji: list('🚗 car|🚕 taxi|🚌 bus|🚎 trolleybus|🚓 police car|🚑 ambulance|🚒 fire engine|🚚 delivery truck|🚜 tractor|🚲 bicycle|🛵 motor scooter|🏍️ motorcycle|🚆 train|🚇 metro|✈️ aeroplane|🚀 rocket|🚁 helicopter|⛵ sailboat|🚢 ship|⚓ anchor|🗺️ world map|🧭 compass|🏠 house|🏢 office building|🏥 hospital|🏫 school|🏨 hotel|🏪 convenience store|🏰 castle|🗽 Statue of Liberty|🗼 Tokyo tower|⛰️ mountain|🏖️ beach with umbrella|🏕️ camping|🌋 volcano|🌍 globe showing Europe and Africa|🌎 globe showing Americas|🌏 globe showing Asia and Australia'),
  },
  {
    name: 'Objects',
    emoji: list('⌚ watch|📱 mobile phone|💻 laptop|⌨️ keyboard|🖥️ desktop computer|🖨️ printer|📷 camera|🎥 movie camera|📺 television|📻 radio|⏰ alarm clock|⏳ hourglass|💡 light bulb|🔦 flashlight|🔋 battery|🔌 electric plug|💰 money bag|💳 credit card|💎 gem stone|🔧 wrench|🔨 hammer|🧰 toolbox|🔑 key|🔒 locked|🔓 unlocked|📦 package|✉️ envelope|📧 e-mail|📝 memo|📅 calendar|📌 pushpin|📎 paperclip|✂️ scissors|📚 books|📖 open book|🔍 magnifying glass|🛒 shopping cart|🎒 backpack|👓 glasses|👕 t-shirt|👟 running shoe|☂️ umbrella|🧸 teddy bear|🛏️ bed|🚪 door'),
  },
  {
    name: 'Symbols',
    emoji: list('❤️ red heart|🧡 orange heart|💛 yellow heart|💚 green heart|💙 blue heart|💜 purple heart|🖤 black heart|🤍 white heart|💔 broken heart|💕 two hearts|💯 hundred points|✅ check mark button|❌ cross mark|❓ question mark|❗ exclamation mark|⚠️ warning|🚫 prohibited|⛔ no entry|♻️ recycling symbol|✨ sparkles|💤 zzz|💬 speech balloon|💭 thought balloon|🔔 bell|🔕 bell with slash|🎵 musical note|➕ plus|➖ minus|➗ divide|✖️ multiply|♾️ infinity|🔴 red circle|🟠 orange circle|🟡 yellow circle|🟢 green circle|🔵 blue circle|🟣 purple circle|⚫ black circle|⚪ white circle|🏁 chequered flag|🚩 triangular flag|🏳️ white flag'),
  },
]

/** The emoji whose names hold every word typed, in any order. */
export function searchEmoji(query: string, categories: readonly EmojiCategory[] = emojiCategories): Emoji[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return []
  return categories.flatMap((category) => category.emoji).filter((emoji) => words.every((word) => emoji.name.toLowerCase().includes(word)))
}

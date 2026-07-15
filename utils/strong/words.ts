// Small, honest word lists for the "Strong" module. None of this leaves the
// browser. The common-password and common-word lists power the "a smart cracker
// tries these first" demonstration; PHRASE_WORDS drives the passphrase
// generator. Real tools (zxcvbn, diceware) use far larger lists; these are
// trimmed to keep the page light while still catching the obvious cases.

// A slice of the passwords that top every breach corpus. Crackers run these
// (and simple mangles of them) before anything else.
export const COMMON_PASSWORDS: string[] = [
  'password', 'passw0rd', '123456', '12345678', '123456789', 'qwerty', 'qwertyuiop',
  'abc123', 'password1', 'iloveyou', 'admin', 'welcome', 'monkey', 'login', 'dragon',
  'sunshine', 'princess', 'football', 'baseball', 'letmein', 'trustno1', 'starwars',
  'whatever', 'superman', 'batman', 'master', 'hello', 'freedom', 'ninja', 'azerty',
  'shadow', 'michael', 'jennifer', 'jordan', 'hunter', 'harley', 'ranger', 'buster',
  'thomas', 'summer', 'ashley', 'nicole', 'chelsea', 'biteme', 'matrix', 'secret',
  'purple', 'orange', 'banana', 'cookie', 'pepper', 'ginger', 'maggie', 'charlie',
  'jessica', 'amanda', 'daniel', 'george', 'computer', 'internet', 'samsung', 'google',
  'zaq12wsx', 'qazwsx', '1q2w3e4r', 'q1w2e3r4', 'asdfgh', 'zxcvbn', '000000', '111111',
  '123123', '654321', '696969', '121212', '112233', 'aa123456', 'password123',
  'admin123', 'root', 'toor', 'pass', 'test', 'guest', 'changeme', 'default'
]

// Everyday words. The lab flags a password that is really "one of these plus a
// predictable tweak" and shows how far its effective strength collapses.
export const COMMON_WORDS: string[] = [
  'password', 'dragon', 'monkey', 'sunshine', 'princess', 'football', 'baseball',
  'summer', 'winter', 'spring', 'autumn', 'orange', 'purple', 'yellow', 'silver',
  'golden', 'banana', 'cookie', 'pepper', 'ginger', 'guitar', 'flower', 'garden',
  'coffee', 'silver', 'shadow', 'thunder', 'rocket', 'planet', 'flying', 'freedom',
  'forever', 'friend', 'family', 'mother', 'father', 'sister', 'brother', 'welcome',
  'hello', 'master', 'secret', 'magic', 'happy', 'lucky', 'tiger', 'eagle', 'falcon',
  'panther', 'wizard', 'knight', 'castle', 'diamond', 'crystal', 'phoenix', 'galaxy',
  'ocean', 'river', 'mountain', 'forest', 'desert', 'island', 'winter', 'august',
  'october', 'january', 'liverpool', 'chelsea', 'arsenal', 'batman', 'superman',
  'ferrari', 'porsche', 'toyota', 'honda', 'apple', 'google', 'amazon', 'samsung'
]

// Simple, concrete, easy-to-picture words for building passphrases. Kept short
// and unambiguous so a generated phrase is genuinely memorable.
export const PHRASE_WORDS: string[] = [
  'anchor', 'apple', 'arrow', 'atlas', 'autumn', 'bacon', 'badge', 'bamboo', 'banjo',
  'basket', 'beacon', 'beetle', 'bench', 'birch', 'bishop', 'bison', 'blossom', 'bottle',
  'boulder', 'bracket', 'branch', 'brick', 'bridge', 'bronze', 'brook', 'bubble', 'bucket',
  'buffalo', 'button', 'cactus', 'candle', 'canyon', 'carbon', 'cargo', 'carrot', 'castle',
  'cedar', 'cellar', 'chalk', 'cherry', 'chimney', 'cinder', 'circus', 'clover', 'cobra',
  'coconut', 'comet', 'compass', 'copper', 'coral', 'cottage', 'cotton', 'cricket', 'crimson',
  'crystal', 'cymbal', 'daisy', 'dolphin', 'domino', 'donkey', 'dragon', 'drummer', 'eagle',
  'ember', 'engine', 'falcon', 'feather', 'ferret', 'fiddle', 'flamingo', 'flint', 'forest',
  'fossil', 'fountain', 'foxglove', 'freckle', 'galaxy', 'garlic', 'gecko', 'ginger', 'glacier',
  'granite', 'grapple', 'gravel', 'guitar', 'hammer', 'harbor', 'hazel', 'hedgehog', 'helmet',
  'heron', 'hickory', 'hollow', 'honey', 'hornet', 'iceberg', 'igloo', 'iguana', 'ivory',
  'jacket', 'jaguar', 'jasmine', 'jelly', 'jigsaw', 'juniper', 'kangaroo', 'kettle', 'kitten',
  'koala', 'ladder', 'lagoon', 'lantern', 'lemon', 'leopard', 'lettuce', 'lichen', 'lilac',
  'lizard', 'lobster', 'locket', 'lotus', 'magnet', 'mango', 'maple', 'marble', 'meadow',
  'medal', 'melon', 'meteor', 'mitten', 'monkey', 'moose', 'mosaic', 'muffin', 'mushroom',
  'mustard', 'narwhal', 'nectar', 'needle', 'nickel', 'noodle', 'nugget', 'nutmeg', 'oatmeal',
  'ocean', 'octopus', 'olive', 'onion', 'orbit', 'orchid', 'osprey', 'otter', 'oyster',
  'paddle', 'panda', 'panther', 'parsley', 'parrot', 'peacock', 'pebble', 'pelican', 'penguin',
  'pepper', 'pewter', 'pickle', 'pigeon', 'pillow', 'pine', 'pistachio', 'pixel', 'planet',
  'plaster', 'plum', 'pocket', 'pony', 'poppy', 'possum', 'pretzel', 'pumpkin', 'puzzle',
  'quartz', 'quiver', 'rabbit', 'raccoon', 'radish', 'rafter', 'raisin', 'raven', 'ribbon',
  'rocket', 'rooster', 'rubber', 'ruby', 'saffron', 'salmon', 'sandal', 'sapling', 'satchel',
  'scarf', 'scooter', 'seagull', 'seashell', 'sequoia', 'shadow', 'shovel', 'shrimp', 'silver',
  'sizzle', 'sketch', 'slipper', 'snail', 'sparrow', 'spinach', 'sprout', 'squash', 'squirrel',
  'stapler', 'sticker', 'stork', 'sugar', 'sunflower', 'swallow', 'sweater', 'tadpole', 'tangelo',
  'teapot', 'thimble', 'thistle', 'thunder', 'timber', 'toaster', 'tomato', 'topaz', 'tortoise',
  'toucan', 'tractor', 'trumpet', 'tulip', 'turnip', 'turtle', 'umbrella', 'unicorn', 'vanilla',
  'velvet', 'violet', 'walnut', 'walrus', 'wombat', 'yogurt', 'zebra', 'zephyr', 'zigzag', 'zinnia',
  'acorn', 'almond', 'amber', 'antler', 'apron', 'aspen', 'awning', 'balloon', 'bangle', 'barley',
  'beacon', 'beaver', 'beetle', 'blanket', 'blizzard', 'bluebird', 'bobcat', 'bonfire', 'boomerang',
  'brownie', 'bumble', 'burrow', 'buzzard', 'cabin', 'cactus', 'caramel', 'cashew', 'catfish',
  'cavern', 'chestnut', 'chipmunk', 'cinnamon', 'clarinet', 'cobbler', 'compost', 'cornet', 'cougar',
  'coyote', 'crayon', 'crumpet', 'cupcake', 'curtain', 'cushion', 'cyclone', 'dagger', 'dandelion',
  'dewdrop', 'dinghy', 'doorway', 'dragonfly', 'dumpling', 'dustpan', 'eggplant', 'elbow', 'elkhorn',
  'emerald', 'envelope', 'espresso', 'fable', 'fennel', 'ferryboat', 'fiddler', 'firefly', 'flapjack',
  'flounder', 'flute', 'foghorn', 'foxhole', 'freezer', 'frostbite', 'gadget', 'gallop', 'gargoyle',
  'gazelle', 'gerbil', 'giraffe', 'gizmo', 'goblet', 'goldfish', 'goose', 'grackle', 'grapefruit',
  'greenhouse', 'griffin', 'grommet', 'guppy', 'gumdrop', 'hacksaw', 'halibut', 'hamlet', 'hamster',
  'harmonica', 'hatchet', 'hazelnut', 'hedge', 'hemlock', 'herring', 'hillside', 'hoedown', 'hopscotch',
  'hornbill', 'hubcap', 'hummingbird', 'husky', 'inkwell', 'ironwood', 'jackal', 'jamboree', 'jasper',
  'jellyfish', 'jetpack', 'jingle', 'jonquil', 'kayak', 'kelp', 'keyhole', 'kingfisher', 'kiwi',
  'kneecap', 'lacquer', 'ladybug', 'lamppost', 'landmark', 'lapwing', 'larkspur', 'lasso', 'lavender',
  'lemonade', 'lifeboat', 'lighthouse', 'limerick', 'linden', 'lollipop', 'longboat', 'lumber',
  'macaw', 'mackerel', 'mallard', 'mammoth', 'mandolin', 'marlin', 'marmot', 'marzipan', 'matchbox',
  'meerkat', 'mermaid', 'milkweed', 'minnow', 'mockingbird', 'molehill', 'moonbeam', 'moorland',
  'moped', 'moray', 'mulberry', 'nightjar', 'nutcracker', 'oarlock', 'oatcake', 'oilcan', 'okapi',
  'oregano', 'oriole', 'ottoman', 'outrigger', 'oxcart', 'paddock', 'pancake', 'papaya', 'parsnip',
  'partridge', 'pastry', 'peacoat', 'pecan', 'pennant', 'periwinkle', 'petunia', 'pheasant', 'piccolo',
  'piglet', 'pinecone', 'pipeline', 'piranha', 'platypus', 'plywood', 'polecat', 'pomelo', 'popcorn',
  'porridge', 'possumhaw', 'postcard', 'pothole', 'prairie', 'primrose', 'pudding', 'pufferfish',
  'quokka', 'radar', 'rainbow', 'ramrod', 'rattan', 'redwood', 'reindeer', 'rhubarb', 'ringtail',
  'riverbed', 'rockslide', 'rosemary', 'rowboat', 'rucksack', 'rutabaga', 'saddle', 'sailboat',
  'sandbar', 'sardine', 'sawdust', 'scallop', 'scarecrow', 'schooner', 'seabird', 'seahorse',
  'seaweed', 'shamrock', 'sheepdog', 'sherbet', 'shingle', 'sidecar', 'skillet', 'skylark', 'sled',
  'snapdragon', 'snowdrift', 'songbird', 'sorbet', 'spaniel', 'sparkler', 'spatula', 'spigot',
  'starfish', 'steamboat', 'stingray', 'stoplight', 'strudel', 'sunbeam', 'sundial', 'swordfish',
  'sycamore', 'tabby', 'tambourine', 'tangerine', 'teakettle', 'termite', 'thornbush', 'tinderbox',
  'toadstool', 'toffee', 'tollbooth', 'toolbox', 'tugboat', 'tumbler', 'tundra', 'turnstile',
  'twinkle', 'valley', 'vineyard', 'wagon', 'walleye', 'washtub', 'waterfall', 'weasel', 'whistle',
  'wildcat', 'willow', 'windmill', 'wolverine', 'woodchuck', 'woodland', 'yardstick', 'yearling'
]

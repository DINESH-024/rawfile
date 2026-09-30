window.SURPRISE_DATA = window.SURPRISE_DATA || {
  gifts: [],
  memories: [],
  timeline: [],
  friends: [],
  parents: {},
  letters: [],
  fallbackWishes: [],
  fallbackPoems: []
};

window.SURPRISE_DATA.load = async function() {
  const files = [
    { key: 'gifts', path: 'data/gifts.json', default: [
      { title: 'Canvas', emoji: '🎨', text: 'This canvas was chosen to hold quiet wishes and bright new beginnings.' },
      { title: 'Sunflower', emoji: '🌻', text: 'Like the flower, may your days always turn toward gentle light.' },
      { title: 'Stitch Doll', emoji: '🧸', text: 'A soft reminder to pause, rest, and take in every calm moment.' },
      { title: 'Special Gift', emoji: '🎁', text: 'A little surprise with layers of love behind every detail.' }
    ]},
    { key: 'memories', path: 'data/memories.json', default: [
      { n: 3, t: 'Your kindness makes everyone feel truly seen.' },
      { n: 7, t: 'You can make ordinary moments feel magical.' },
      { n: 11, t: 'Your laugh brightens the darkest evening.' },
      { n: 19, t: 'You have an instinct for caring in the quietest ways.' },
      { n: 23, t: 'You turn small plans into favorite memories.' },
      { n: 31, t: 'Your curiosity makes every conversation feel alive.' },
      { n: 47, t: 'You show up with steady warmth and thoughtful care.' },
      { n: 52, t: 'You make people feel welcomed and at ease.' },
      { n: 68, t: 'Your presence helps others breathe a little easier.' },
      { n: 79, t: 'Simply put, you are a beautiful soul to know.' }
    ]},
    { key: 'timeline', path: 'data/timeline.json', default: [
      { year: '2004', title: 'A Star Was Born', text: 'Deepika arrived on 29 September, opening a new chapter full of warmth and wonder.' },
      { year: '2010', title: 'First Spark', text: 'You began shining in your own way through small, kind gestures.' },
      { year: '2016', title: 'Growing Brighter', text: 'Every year your smile became more open and your presence more genuine.' },
      { year: '2020', title: 'Quiet Strength', text: 'You faced challenges with grace, finding light through the heavy moments.' },
      { year: '2022', title: 'New Horizons', text: 'Your courage created fresh paths and inspired trusted hearts.' },
      { year: '2024', title: 'Heart of the Story', text: 'This celebration is for the person who brings warmth, calm, and love to so many days.' }
    ]},
    { key: 'friends', path: 'data/friends.json', default: [
      { name: 'Isha', text: 'Deepika, your laughter always makes the day softer. Thank you for being a gentle light.' },
      { name: 'Sana', text: 'Every conversation with you feels cozy and real. Happy birthday, beautiful soul.' },
      { name: 'Mira', text: 'You remind me that quiet kindness is the strongest kind. So grateful for you.' },
      { name: 'Anjali', text: 'Your presence turns ordinary plans into cherished moments.' }
    ]},
    { key: 'parents', path: 'data/parents.json', default: {
      mother: 'Thank you for the warmth you give every day. Your gentle care shapes the people who love you most.',
      father: 'Thank you for the steady support and quiet strength that makes home feel safe.'
    }},
    { key: 'letters', path: 'data/letters.json', default: [
      'Dear Deepika,',
      'This day is a small pause to remind you how truly special you are.',
      'You bring softness to the loudest rooms and light to the simplest moments.',
      'May this new year be filled with courage, laughter, and more dreams coming true.',
      'Always believe that you are loved, celebrated, and never alone.',
      'With all my heart, happy birthday.'
    ]},
    { key: 'quotes', path: 'data/quotes.json', default: [
      'May every quiet sunrise feel like a gentle promise fulfilled.',
      'A heart as kind as yours turns simple days into treasured memories.',
      'You are a light that makes the world feel softer and kinder.'
    ]},
    { key: 'fallbackWishes', path: 'data/wishes.json', default: [
      'May this year bring gentle surprises, quiet joy, and new dreams to chase.',
      'Keep shining in your own calm, radiant way.',
      'Your grace and warmth make everything around you feel golden.'
    ]},
    { key: 'fallbackPoems', path: 'data/poems.json', default: [
      'A quiet sky wrapped in your laughter, soft petals turning toward your light.',
      'A wish carved in moonlight, carried by butterflies, blooming into the kindest morning.'
    ]}
  ];

  await Promise.all(files.map(async (file) => {
    try {
      const response = await fetch(file.path, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to load ${file.path}`);
      }
      const data = await response.json();
      window.SURPRISE_DATA[file.key] = data;
    } catch (error) {
      window.SURPRISE_DATA[file.key] = file.default;
    }
  }));
};

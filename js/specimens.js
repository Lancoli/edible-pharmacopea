// The Archive Botanique catalogue.
// soins = [light, humidity, watering, growth], each from 1 to 5.
// dessin = parameters read by drawing.js to paint the cutting in its tube.
window.ARMOIRES = [
  {
    id: 'aroidees', numero: 'I', nom: 'Aroïdées', image: 'assets/img/cabinet-green.jpg', neon: '#8fe8b8',
    alt: 'Armoire vitrée aux néons verts, étagères garnies de tubes de boutures d\'aroïdées.',
    sous: 'Araceae · forêts humides des tropiques',
    texte: 'Monstera, philodendrons, anthuriums. Les feuilles à trous, les velours, les panachures qui font les collections. Néons verts, sphaigne humide.'
  },
  {
    id: 'hoyas', numero: 'II', nom: 'Hoyas & cireuses', image: 'assets/img/cabinet-amber.jpg', neon: '#f3c978',
    alt: 'Armoire vitrée aux néons ambrés, étagères garnies de tubes de boutures de hoyas.',
    sous: 'Apocynaceae · fleurs de porcelaine',
    texte: 'Feuilles épaisses comme de la cire, lianes qui fleurissent en ombelles parfumées le soir. Des boutures solides, qui supportent bien le voyage.'
  },
  {
    id: 'begonias', numero: 'III', nom: 'Bégonias & bijoux', image: 'assets/img/cabinet-blue.jpg', neon: '#8fd4f5',
    alt: 'Armoire vitrée aux néons bleus, étagères garnies de tubes de boutures de bégonias.',
    sous: 'Begoniaceae, Orchidaceae · sous-bois et terrariums',
    texte: 'Pois, spirales, feuilles noires et reflets bleus. La plupart vivent mieux sous cloche ou en terrarium : humidité haute, lumière douce.'
  },
  {
    id: 'curiosites', numero: 'IV', nom: 'Cabinet de curiosités', image: 'assets/img/cabinet-plum.jpg', neon: '#d6a8f5',
    alt: 'Armoire vitrée aux néons prunes, étagères garnies de tubes de plantes rares et curieuses.',
    sous: 'Écailles, carapaces, fossiles vivants',
    texte: 'Plantes qui grimpent à plat comme des tuiles, fougères en cuir de crocodile, une lignée vieille de 400 millions d\'années.'
  }
];

window.RARETES = {
  1: { nom: 'Commune', court: 'C' },
  2: { nom: 'Peu commune', court: 'PC' },
  3: { nom: 'Rare', court: 'R' },
  4: { nom: 'Très rare', court: 'TR' },
  5: { nom: 'Spécimen d\'archive', court: 'A' }
};

window.SPECIMENS = [
  // ——— Cabinet I · Aroids ———
  {
    id: 'thai-constellation', n: 1, armoire: 0, place: [1, 0],
    latin: 'Monstera deliciosa', cultivar: 'Thai Constellation', fr: 'Monstera constellation', famille: 'Araceae',
    origine: 'Cultivar issu de culture in vitro, Thaïlande', rarete: 3, eclat: true, prix: 65, racinee: 85, stock: 4,
    texte: 'Panachure crème en éclaboussures d\'étoiles, stable parce qu\'elle est née en laboratoire. Chaque feuille est un ciel différent. Les premières fenestrations arrivent vers la troisième ou quatrième feuille.',
    soins: [4, 3, 3, 3],
    dessin: { forme: 'monstera', n: 2, l: 1.1, w: .72, c: '#2b5a33', c2: '#4f8a4c', motif: ['constellation'], mc: '#efe6c6' }
  },
  {
    id: 'gloriosum', n: 2, armoire: 0, place: [1, 1],
    latin: 'Philodendron gloriosum', fr: 'Philodendron velours', famille: 'Araceae',
    origine: 'Colombie', rarete: 2, prix: 32, racinee: 44, stock: 6,
    texte: 'Un rampant : la tige court au ras du substrat et chaque feuille en cœur, veloutée, est soulignée de nervures ivoire. Préférez un bac large à un pot profond.',
    soins: [3, 4, 3, 2],
    dessin: { forme: 'coeur', n: 2, l: 1.05, w: .78, c: '#1d4529', c2: '#2c623a', motif: ['nervures', 'velours'], mc: '#e6efd6' }
  },
  {
    id: 'warocqueanum', n: 3, armoire: 0, place: [1, 2],
    latin: 'Anthurium warocqueanum', fr: 'Reine des anthuriums', famille: 'Araceae',
    origine: 'Colombie, forêts humides du Chocó', rarete: 4, prix: 95, racinee: 125, stock: 2,
    texte: 'Feuilles pendantes, étroites, en velours vert bouteille. Un pied adulte dépasse le mètre. Épiphyte : sphaigne et air autour des racines, jamais de terre compacte.',
    soins: [3, 5, 3, 2],
    dessin: { forme: 'lance', n: 2, l: 1.45, w: .3, c: '#14321d', c2: '#22502d', motif: ['nervures', 'velours'], mc: '#b9d8a8' }
  },
  {
    id: 'melanochrysum', n: 4, armoire: 0, place: [2, 0],
    latin: 'Philodendron melanochrysum', fr: 'Philodendron noir et or', famille: 'Araceae',
    origine: 'Colombie, Équateur', rarete: 3, prix: 45, racinee: 60, stock: 3,
    texte: 'Velours presque noir semé de paillettes dorées qu\'on ne voit qu\'en lumière rasante. Grimpeur : donnez-lui un tuteur de mousse et les feuilles doublent de taille à chaque nœud.',
    soins: [3, 4, 3, 3],
    dessin: { forme: 'coeur', n: 2, l: 1.25, w: .48, c: '#18261a', c2: '#34431f', motif: ['nervures', 'paillettes', 'velours'], mc: '#e8d48a' }
  },
  {
    id: 'pink-princess', n: 5, armoire: 0, place: [2, 1],
    latin: 'Philodendron erubescens', cultivar: 'Pink Princess', fr: 'Philodendron princesse rose', famille: 'Araceae',
    origine: 'Cultivar horticole', rarete: 2, eclat: true, prix: 29, racinee: 38, stock: 8,
    texte: 'Feuilles bordeaux presque noires, éclaboussées de rose bonbon. Le rose ne se maintient qu\'avec de la lumière : près d\'une fenêtre claire, sans soleil direct.',
    soins: [4, 3, 3, 3],
    dessin: { forme: 'coeur', n: 2, l: 1, w: .58, c: '#371b24', c2: '#5a2a36', motif: ['rose'], mc: '#f3a6bf', tige: '#5a2a30' }
  },
  {
    id: 'tetrasperma', n: 6, armoire: 0, place: [2, 2],
    latin: 'Rhaphidophora tetrasperma', fr: 'Mini monstera', famille: 'Araceae',
    origine: 'Thaïlande, Malaisie', rarete: 1, prix: 12, racinee: 16, stock: 14,
    texte: 'On l\'appelle mini monstera, ce n\'en est pas une. Elle grimpe vite et découpe ses feuilles très tôt. C\'est souvent le premier tube d\'une collection.',
    soins: [3, 3, 3, 5],
    dessin: { forme: 'decoupee', n: 3, l: .85, w: .6, c: '#2c6630', c2: '#4f9a48' }
  },
  {
    id: 'silvery-ann', n: 7, armoire: 0, place: [3, 0],
    latin: 'Scindapsus pictus', cultivar: 'Silvery Ann', fr: 'Pothos satiné', famille: 'Araceae',
    origine: 'Asie du Sud-Est', rarete: 1, prix: 9, racinee: 12, stock: 20,
    texte: 'Feuilles mates éclaboussées d\'argent, qui scintillent sous une lampe. Pardonne les oublis d\'arrosage. Le tube idéal pour offrir.',
    soins: [2, 2, 2, 3],
    dessin: { forme: 'coeur', n: 3, l: .8, w: .55, c: '#21412c', c2: '#2f5a3c', motif: ['argent'], mc: '#d4e6dc' }
  },
  {
    id: 'cebu-blue', n: 8, armoire: 0, place: [3, 1],
    latin: 'Epipremnum pinnatum', cultivar: 'Cebu Blue', fr: 'Pothos bleu de Cebu', famille: 'Araceae',
    origine: 'Philippines, île de Cebu', rarete: 2, prix: 14, racinee: 19, stock: 0,
    texte: 'Jeune, ses feuilles en lance ont un reflet bleu métallisé. Adulte, sur un tuteur, elles se découpent comme celles d\'une monstera.',
    soins: [3, 3, 3, 4],
    dessin: { forme: 'lance', n: 3, l: .9, w: .42, c: '#4a7876', c2: '#8ab4b0', motif: ['metal'], milieu: 'eau' }
  },
  {
    id: 'adansonii-albo', n: 9, armoire: 0, place: [3, 2],
    latin: 'Monstera adansonii', cultivar: 'Albo Variegata', fr: 'Monstera adansonii panaché', famille: 'Araceae',
    origine: 'Cultivar (espèce : Amérique centrale et du Sud)', rarete: 4, eclat: true, prix: 120, racinee: 150, stock: 1,
    texte: 'Panachure blanche en demi-lune ou en marbre, jamais deux feuilles pareilles. Les zones blanches ne font pas de photosynthèse : croissance lente, lumière vive indispensable.',
    soins: [4, 4, 3, 2],
    dessin: { forme: 'perforee', n: 2, l: .95, w: .52, trous: .45, c: '#2a5e33', c2: '#4f8f48', motif: ['demi'], mc: '#f3f0e6' }
  },
  {
    id: 'spiritus-sancti', n: 10, armoire: 0, place: ['cloche'],
    latin: 'Philodendron spiritus-sancti', fr: 'Philodendron du Saint-Esprit', famille: 'Araceae',
    origine: 'Brésil, État d\'Espírito Santo', rarete: 5, prix: 340, racinee: null, stock: 1,
    texte: 'Il ne reste qu\'une poignée de pieds connus à l\'état sauvage. Feuilles étroites et pendantes qui atteignent 60 cm. Le nôtre vient de culture, jamais d\'un prélèvement en forêt.',
    soins: [3, 4, 3, 2],
    dessin: { forme: 'lance', n: 3, l: 1.5, w: .2, c: '#1b4626', c2: '#3d7a3c', motif: ['nervures'], mc: '#9cc890' }
  },

  // ——— Cabinet II · Hoyas & wax plants ———
  {
    id: 'krimson-queen', n: 11, armoire: 1, place: [1, 0],
    latin: 'Hoya carnosa', cultivar: 'Krimson Queen', fr: 'Fleur de porcelaine panachée', famille: 'Apocynaceae',
    origine: 'Cultivar (espèce : Asie de l\'Est, Australie)', rarete: 1, eclat: true, prix: 11, racinee: 15, stock: 12,
    texte: 'Feuilles cireuses bordées de crème, et les nouvelles pousses naissent roses. Les fleurs en ombelles sentent fort le soir. Ne coupez jamais les vieux pédoncules : elle refleurit dessus.',
    soins: [4, 2, 2, 3],
    dessin: { forme: 'ovale', n: 3, l: .72, w: .5, c: '#2a5a32', c2: '#3f7a40', motif: ['bord', 'epais'], mc: '#f0e2c4', mc2: '#eba3b6' }
  },
  {
    id: 'kerrii', n: 12, armoire: 1, place: [1, 1],
    latin: 'Hoya kerrii', fr: 'Hoya cœur', famille: 'Apocynaceae',
    origine: 'Asie du Sud-Est', rarete: 1, prix: 9, racinee: 12, stock: 18,
    texte: 'La feuille en cœur de la Saint-Valentin. Ici c\'est une vraie bouture avec un nœud : elle fera une liane, pas seulement un cœur planté dans un pot.',
    soins: [4, 2, 1, 1],
    dessin: { forme: 'coeurInv', n: 2, l: .62, w: .75, c: '#2c662d', c2: '#4a8a3c', motif: ['epais'], epais: 1.4 }
  },
  {
    id: 'linearis', n: 13, armoire: 1, place: [1, 2],
    latin: 'Hoya linearis', fr: 'Hoya aiguille', famille: 'Apocynaceae',
    origine: 'Himalaya : Népal, nord de l\'Inde, sud-ouest de la Chine', rarete: 2, prix: 16, racinee: 22, stock: 5,
    texte: 'Des cascades de feuilles en aiguilles, couvertes d\'un duvet fin. Elle aime la fraîcheur et l\'humidité, et déteste l\'air sec des radiateurs.',
    soins: [3, 4, 3, 2],
    dessin: { forme: 'aiguille', n: 10, l: 1, w: .12, c: '#5d7a52', c2: '#8aa47a', motif: ['duvet'], tige: '#6a7a52' }
  },
  {
    id: 'callistophylla', n: 14, armoire: 1, place: [2, 0],
    latin: 'Hoya callistophylla', fr: 'Hoya gravé', famille: 'Apocynaceae',
    origine: 'Bornéo', rarete: 3, prix: 26, racinee: 34, stock: 4,
    texte: 'Grandes feuilles vert tendre parcourues d\'un réseau de nervures sombres, comme une gravure à l\'encre. Fleurs jaune pâle au cœur bordeaux.',
    soins: [3, 3, 2, 3],
    dessin: { forme: 'lance', n: 3, l: 1, w: .4, c: '#7aa548', c2: '#a9c96a', motif: ['nervures-sombres', 'epais'], mc: '#2a4820' }
  },
  {
    id: 'macrophylla-albo', n: 15, armoire: 1, place: [2, 1],
    latin: 'Hoya macrophylla', cultivar: 'Albomarginata', fr: 'Hoya à grandes feuilles bordées', famille: 'Apocynaceae',
    origine: 'Cultivar (espèce : Asie du Sud-Est)', rarete: 2, eclat: true, prix: 22, racinee: 29, stock: 6,
    texte: 'Feuilles larges et épaisses bordées de crème, qui rosissent au soleil. Vigoureuse et facile, c\'est le bon éclat pour commencer.',
    soins: [4, 2, 2, 4],
    dessin: { forme: 'ovale', n: 2, l: 1.02, w: .48, c: '#2a5a2e', c2: '#4a8040', motif: ['bord', 'epais'], mc: '#f2e6c8', mc2: '#f2c4c0' }
  },
  {
    id: 'sunrise', n: 16, armoire: 1, place: [2, 2],
    latin: 'Hoya', cultivar: 'Sunrise', fr: 'Hoya lever de soleil', famille: 'Apocynaceae',
    origine: 'Hybride horticole', rarete: 2, prix: 18, racinee: 24, stock: 7,
    texte: 'En pleine lumière, ses feuilles virent au rouge cuivré, comme un lever de soleil. Ombelles roses parfumées.',
    soins: [5, 2, 2, 3],
    dessin: { forme: 'ovale', n: 3, l: .72, w: .42, c: '#4c682c', c2: '#b4482a', motif: ['taches', 'epais'], mc: '#e0e8b8' }
  },
  {
    id: 'imperialis', n: 17, armoire: 1, place: [3, 0],
    latin: 'Hoya imperialis', fr: 'Hoya impérial', famille: 'Apocynaceae',
    origine: 'Bornéo, péninsule Malaise', rarete: 4, prix: 58, racinee: null, stock: 0,
    texte: 'Les plus grandes fleurs du genre : jusqu\'à 8 cm, pourpres à couronne crème. Liane exigeante qui veut une chaleur constante. Revient à l\'arrivage de novembre.',
    soins: [4, 4, 3, 3],
    dessin: { forme: 'lance', n: 2, l: 1.2, w: .38, c: '#2a522e', c2: '#3f7240', motif: ['nervures', 'epais'], mc: '#7aa86a' }
  },
  {
    id: 'dischidia-ovata', n: 18, armoire: 1, place: [3, 1],
    latin: 'Dischidia ovata', fr: 'Dischidia pastèque', famille: 'Apocynaceae',
    origine: 'Australie (Queensland), Nouvelle-Guinée', rarete: 2, prix: 12, racinee: 16, stock: 9,
    texte: 'Petites feuilles rayées comme une pastèque. Épiphyte légère : elle passe du tube à une plaque de liège sans transition.',
    soins: [3, 4, 2, 3],
    dessin: { forme: 'ovale', n: 5, l: .55, w: .55, c: '#3b5a32', c2: '#5f8a4c', motif: ['raye'], mc: '#bcd8a4' }
  },
  {
    id: 'ceropegia-variegata', n: 19, armoire: 1, place: [3, 2],
    latin: 'Ceropegia woodii', cultivar: 'Variegata', fr: 'Chaîne des cœurs panachée', famille: 'Apocynaceae',
    origine: 'Cultivar (espèce : Afrique australe)', rarete: 1, eclat: true, prix: 10, racinee: 13, stock: 11,
    texte: 'Le collier de cœurs, panaché de rose et de crème. Pousse en rideau, se bouture en quelques jours dans l\'eau.',
    soins: [4, 2, 1, 5],
    dessin: { forme: 'perles', feuille: 'coeur', n: 7, l: .5, w: .8, c: '#3a5a40', c2: '#6a8a6a', motif: ['bord'], mc: '#f3c3d0', tige: '#8a5a6a', milieu: 'eau' }
  },
  {
    id: 'clemensiorum', n: 20, armoire: 1, place: ['cloche'],
    latin: 'Hoya clemensiorum', fr: 'Hoya de Clemens', famille: 'Apocynaceae',
    origine: 'Bornéo, forêts d\'altitude', rarete: 5, prix: 190, racinee: null, stock: 1,
    texte: 'Feuilles géantes qui approchent les 30 cm, veinées comme une carte. Peu de collectionneurs en Europe possèdent un clone en bonne santé. Celui-ci a trois nœuds et deux feuilles.',
    soins: [3, 5, 3, 1],
    dessin: { forme: 'lance', n: 2, l: 1.45, w: .38, c: '#3a682e', c2: '#5e8c3e', motif: ['nervures', 'epais'], mc: '#c4dc96' }
  },

  // ——— Cabinet III · Begonias & jewels ———
  {
    id: 'maculata', n: 21, armoire: 2, place: [1, 0],
    latin: 'Begonia maculata', cultivar: 'Wightii', fr: 'Bégonia à pois', famille: 'Begoniaceae',
    origine: 'Cultivar (espèce : Brésil)', rarete: 1, prix: 10, racinee: 14, stock: 15,
    texte: 'Feuilles en aile d\'ange, vert olive à pois argent, revers rouge sang. Grappes de fleurs blanches presque toute l\'année.',
    soins: [3, 3, 3, 4],
    dessin: { forme: 'aile', n: 3, l: 1, w: .45, c: '#3a4c34', c2: '#4f6a44', motif: ['pois'], mc: '#e8eef0', revers: '#8a2230', tige: '#6a4a3a' }
  },
  {
    id: 'pavonina', n: 22, armoire: 2, place: [1, 1],
    latin: 'Begonia pavonina', fr: 'Bégonia paon', famille: 'Begoniaceae',
    origine: 'Malaisie, Cameron Highlands', rarete: 4, eclat: true, prix: 68, racinee: null, stock: 2,
    texte: 'Sous une lumière douce, ses feuilles virent au bleu électrique. Ce sont ses chloroplastes, appelés iridoplastes, qui renvoient le bleu. Terrarium obligatoire.',
    soins: [1, 5, 3, 2],
    dessin: { forme: 'rond', n: 3, l: .58, w: .82, c: '#1c3838', c2: '#24504e', motif: ['iris'], tige: '#4a3a3a' }
  },
  {
    id: 'amphioxus', n: 23, armoire: 2, place: [1, 2],
    latin: 'Begonia amphioxus', fr: 'Bégonia amphioxus', famille: 'Begoniaceae',
    origine: 'Bornéo, Sabah', rarete: 3, prix: 42, racinee: 56, stock: 3,
    texte: 'Feuilles étroites en lame, mouchetées et bordées de rouge. Posé sur sa tige, on dirait un insecte. Terrarium, lumière douce.',
    soins: [2, 5, 3, 2],
    dessin: { forme: 'lance', n: 3, l: .8, w: .24, c: '#3a583a', c2: '#557a4a', motif: ['pois-rouges', 'bord-rouge'], mc: '#b42a2a', tige: '#7a3a2a' }
  },
  {
    id: 'escargot', n: 24, armoire: 2, place: [2, 0],
    latin: 'Begonia rex', cultivar: 'Escargot', fr: 'Bégonia escargot', famille: 'Begoniaceae',
    origine: 'Cultivar horticole', rarete: 1, prix: 12, racinee: 16, stock: 10,
    texte: 'Des spirales argent et vert qui s\'enroulent comme une coquille. Un fragment de feuille posé sur du substrat humide suffit à faire une nouvelle plante.',
    soins: [2, 3, 3, 3],
    dessin: { forme: 'rond', n: 2, l: .62, w: .85, c: '#2c482a', c2: '#3b5c34', motif: ['spirale'], mc: '#ccd8d0', tige: '#6a3a3a' }
  },
  {
    id: 'darthvaderiana', n: 25, armoire: 2, place: [2, 1],
    latin: 'Begonia darthvaderiana', fr: 'Bégonia noir de Sarawak', famille: 'Begoniaceae',
    origine: 'Bornéo, Sarawak', rarete: 3, prix: 48, racinee: null, stock: 0,
    texte: 'Feuilles noires, presque mates, au centre à peine rougi. Elle vit dans la pénombre des sous-bois : terrarium et lumière douce.',
    soins: [1, 5, 3, 2],
    dessin: { forme: 'rond', n: 2, l: .62, w: .8, c: '#121417', c2: '#24262c', motif: ['coeur-rouge'], mc: '#6a1a28', tige: '#3a2a2a' }
  },
  {
    id: 'ferox', n: 26, armoire: 2, place: [2, 2],
    latin: 'Begonia ferox', fr: 'Bégonia féroce', famille: 'Begoniaceae',
    origine: 'Chine (Guangxi), Vietnam', rarete: 3, prix: 36, racinee: 48, stock: 4,
    texte: 'Feuilles bosselées, couvertes de cloques pointues vert pomme sur fond presque noir. Malgré son nom, elle ne pique pas.',
    soins: [2, 5, 3, 2],
    dessin: { forme: 'rond', n: 2, l: .62, w: .8, c: '#202c1a', c2: '#34442a', motif: ['cloques'], mc: '#9fd04a', tige: '#4a3a2a' }
  },
  {
    id: 'silver-skies', n: 27, armoire: 2, place: [3, 0],
    latin: 'Episcia cupreata', cultivar: 'Silver Skies', fr: 'Violette flamme argentée', famille: 'Gesneriaceae',
    origine: 'Cultivar (espèce : Amérique du Sud tropicale)', rarete: 1, prix: 9, racinee: 12, stock: 13,
    texte: 'Velours argenté aux bords bronze, petites fleurs rouge vif. Elle lance des stolons qu\'on bouture à l\'infini.',
    soins: [2, 4, 3, 4],
    dessin: { forme: 'ovale', n: 3, l: .58, w: .6, c: '#6a4e32', c2: '#9a7a4a', motif: ['argent-plein'], mc: '#ccd8d0' }
  },
  {
    id: 'pemphidius', n: 28, armoire: 2, place: [3, 1],
    latin: 'Nautilocalyx pemphidius', fr: 'Nautilocalyx gaufré', famille: 'Gesneriaceae',
    origine: 'Pérou', rarete: 2, prix: 19, racinee: 25, stock: 5,
    texte: 'Feuilles gaufrées et cuivrées, comme du papier froissé puis déplié. Plante de sous-bois, elle veut une humidité forte.',
    soins: [2, 5, 3, 3],
    dessin: { forme: 'lance', n: 3, l: .85, w: .4, c: '#46381f', c2: '#6c5a2c', motif: ['gaufre'] }
  },
  {
    id: 'ludisia', n: 29, armoire: 2, place: [3, 2],
    latin: 'Ludisia discolor', fr: 'Orchidée-bijou', famille: 'Orchidaceae',
    origine: 'Asie du Sud-Est, sud de la Chine', rarete: 1, prix: 15, racinee: 19, stock: 9,
    texte: 'Une orchidée qu\'on cultive pour ses feuilles : velours bordeaux strié de nervures roses. Elle se bouture par morceaux de tige.',
    soins: [2, 4, 3, 3],
    dessin: { forme: 'ovale', n: 4, l: .6, w: .45, c: '#2a1a24', c2: '#3d2234', motif: ['nervures', 'velours'], mc: '#eaa8bc', tige: '#4a2a3a' }
  },
  {
    id: 'macodes-petola', n: 30, armoire: 2, place: ['cloche'],
    latin: 'Macodes petola', fr: 'Orchidée-bijou aux veines d\'or', famille: 'Orchidaceae',
    origine: 'Indonésie, Philippines, Malaisie', rarete: 5, eclat: true, prix: 120, racinee: null, stock: 1,
    texte: 'Ses nervures renvoient la lumière comme un fil d\'or, un circuit vivant posé sur du velours vert. Une vraie plante de cloche : humidité constante, jamais de soleil.',
    soins: [2, 5, 3, 2],
    dessin: { forme: 'ovale', n: 4, l: .72, w: .55, c: '#284828', c2: '#3d6a38', motif: ['or', 'velours'], mc: '#f2d27a' }
  },

  // ——— Cabinet IV · Cabinet of curiosities ———
  {
    id: 'marcgravia', n: 31, armoire: 3, place: [1, 0],
    latin: 'Marcgravia sintenisii', fr: 'Marcgravia en écailles', famille: 'Marcgraviaceae',
    origine: 'Porto Rico', rarete: 3, prix: 34, racinee: 44, stock: 3,
    texte: 'Une plante « en écailles » : ses feuilles juvéniles se plaquent contre leur support comme des tuiles. Laissez-la monter sur une planche de bois humide.',
    soins: [3, 4, 3, 3],
    dessin: { forme: 'ecaille', n: 6, l: .9, w: .8, c: '#2b4830', c2: '#466a44', motif: ['nervures'], mc: '#7aa07a' }
  },
  {
    id: 'cryptantha', n: 32, armoire: 3, place: [1, 1],
    latin: 'Rhaphidophora cryptantha', fr: 'Rhaphidophora en écusson', famille: 'Araceae',
    origine: 'Papouasie-Nouvelle-Guinée', rarete: 4, prix: 58, racinee: 75, stock: 2,
    texte: 'Feuilles argentées veinées de sombre, plaquées sur leur planche comme un écusson. Lente au départ, puis elle s\'élance.',
    soins: [2, 5, 3, 2],
    dessin: { forme: 'ecaille', n: 5, l: 1, w: .75, c: '#2a3e38', c2: '#5a7a72', motif: ['argent', 'nervures-sombres'], mc: '#c4d8d0' }
  },
  {
    id: 'dubia', n: 33, armoire: 3, place: [1, 2],
    latin: 'Monstera dubia', fr: 'Monstera dubia, forme juvénile', famille: 'Araceae',
    origine: 'Amérique centrale et du Sud', rarete: 3, prix: 38, racinee: 48, stock: 4,
    texte: 'Jeune, elle grimpe à plat avec des feuilles marbrées d\'argent. Adulte, elle se décolle et ses feuilles se percent. Ici, elle est livrée à l\'âge des écailles.',
    soins: [3, 4, 3, 3],
    dessin: { forme: 'ecaille', n: 5, l: .95, w: .7, c: '#284830', c2: '#6a8a6a', motif: ['argent'], mc: '#c0d4c2' }
  },
  {
    id: 'piper-crocatum', n: 34, armoire: 3, place: [2, 0],
    latin: 'Piper crocatum', fr: 'Poivrier rose', famille: 'Piperaceae',
    origine: 'Pérou', rarete: 2, prix: 16, racinee: 21, stock: 7,
    texte: 'Un poivrier ornemental : feuilles en cœur vert profond, nervures rose argenté, revers pourpre. Liane souple, facile en suspension.',
    soins: [3, 4, 3, 4],
    dessin: { forme: 'coeur', n: 3, l: .9, w: .6, c: '#1d382a', c2: '#2c4a32', motif: ['nervures'], mc: '#ecb4c8', revers: '#5a1f3a', tige: '#5a2a3a' }
  },
  {
    id: 'prostrata', n: 35, armoire: 3, place: [2, 1],
    latin: 'Peperomia prostrata', fr: 'Collier de tortues', famille: 'Piperaceae',
    origine: 'Brésil', rarete: 1, prix: 11, racinee: 14, stock: 8,
    texte: 'Des feuilles rondes de quelques millimètres, marbrées comme une carapace. Elle pousse en tapis ou en cascade. Arrosez peu.',
    soins: [3, 4, 2, 3],
    dessin: { forme: 'perles', feuille: 'rond', n: 9, l: .45, w: .9, c: '#36463a', c2: '#5a6e58', motif: ['carapace'], mc: '#c8d8c4', tige: '#6a4a4a' }
  },
  {
    id: 'selaginella', n: 36, armoire: 3, place: [2, 2],
    latin: 'Selaginella willdenowii', fr: 'Sélaginelle paon', famille: 'Selaginellaceae',
    origine: 'Asie du Sud-Est', rarete: 2, eclat: true, prix: 14, racinee: null, stock: 6,
    texte: 'Ni fougère ni mousse, mais une lignée vieille de plus de 400 millions d\'années. À l\'ombre, ses frondes deviennent bleu paon iridescent.',
    soins: [1, 5, 4, 4],
    dessin: { forme: 'fronde', n: 3, c: '#1e5a5a', c2: '#3fb0c0', motif: ['iris'] }
  },
  {
    id: 'nanouk', n: 37, armoire: 3, place: [3, 0],
    latin: 'Tradescantia albiflora', cultivar: 'Nanouk', fr: 'Misère arc-en-ciel', famille: 'Commelinaceae',
    origine: 'Cultivar horticole', rarete: 1, prix: 6, racinee: 8, stock: 22,
    texte: 'Rayures rose, crème et vert sur une tige charnue. Pousse vite et pardonne tout. Le tube qu\'on glisse dans la caisse pour la route.',
    soins: [4, 2, 3, 5],
    dessin: { forme: 'lance', n: 4, l: .6, w: .38, c: '#6a8a5a', c2: '#a8c890', motif: ['raye-rose'], mc: '#f2a8c8', tige: '#8a5a6a', milieu: 'eau' }
  },
  {
    id: 'crocodyllus', n: 38, armoire: 3, place: [3, 1],
    latin: 'Microsorum musifolium', cultivar: 'Crocodyllus', fr: 'Fougère crocodile', famille: 'Polypodiaceae',
    origine: 'Cultivar (espèce : Asie du Sud-Est)', rarete: 2, prix: 22, racinee: 28, stock: 5,
    texte: 'Une fronde en lanière, gaufrée et réticulée comme un cuir de reptile. Livrée en éclat de rhizome avec ses racines.',
    soins: [2, 4, 3, 2],
    dessin: { forme: 'lance', n: 3, l: 1.15, w: .2, c: '#548a38', c2: '#9ac25a', motif: ['gaufre'], tige: '#5a4a2a' }
  },
  {
    id: 'moon-valley', n: 39, armoire: 3, place: [3, 2],
    latin: 'Pilea involucrata', cultivar: 'Moon Valley', fr: 'Pilea vallée de la lune', famille: 'Urticaceae',
    origine: 'Cultivar (espèce : Amérique centrale et du Sud)', rarete: 1, prix: 8, racinee: 11, stock: 12,
    texte: 'Feuilles gaufrées comme une surface lunaire, vert pomme creusé de nervures bronze. Parfaite en terrarium.',
    soins: [2, 4, 3, 4],
    dessin: { forme: 'ovale', n: 4, l: .55, w: .5, c: '#2c4a20', c2: '#6a8a3a', motif: ['gaufre', 'nervures-sombres'], mc: '#3a2a1a' }
  },
  {
    id: 'obliqua-peru', n: 40, armoire: 3, place: ['cloche'],
    latin: 'Monstera obliqua', cultivar: 'Peru', fr: 'Monstera obliqua', famille: 'Araceae',
    origine: 'Pérou, Amazonie', rarete: 5, prix: 260, racinee: null, stock: 1,
    texte: 'La feuille qui a plus de trous que de limbe. Fine comme du papier de soie, lente, elle exige une humidité de serre. Souvent imitée, rarement vendue sous son vrai nom.',
    soins: [3, 5, 3, 1],
    dessin: { forme: 'perforee', n: 3, l: .9, w: .5, trous: 1, c: '#3a7a3a', c2: '#64a456' }
  }
];

// Collector's drawer: opens when the herbarium has 5 specimens.
window.TIROIR_SECRET = [
  {
    id: 'mint', n: 41, armoire: null, secret: true,
    latin: 'Monstera deliciosa', cultivar: 'Mint', fr: 'Monstera menthe', famille: 'Araceae',
    origine: 'Cultivar horticole', rarete: 5, eclat: true, prix: 220, racinee: null, stock: 1,
    texte: 'Une panachure vert menthe, presque phosphorescente, qui couvre la feuille par plaques. Très peu de pieds stables circulent en Europe.',
    soins: [4, 3, 3, 2],
    dessin: { forme: 'monstera', n: 2, l: 1.1, w: .72, c: '#2b5a33', c2: '#4f8a4c', motif: ['menthe'], mc: '#bfe8c8' }
  },
  {
    id: 'ace-of-spades', n: 42, armoire: null, secret: true,
    latin: 'Anthurium', cultivar: 'Ace of Spades', fr: 'Anthurium as de pique', famille: 'Araceae',
    origine: 'Hybride horticole', rarete: 4, prix: 85, racinee: 110, stock: 2,
    texte: 'Feuilles en as de pique, velours noir-vert et nervures argent. Un hybride de collection qui tient bien en appartement.',
    soins: [3, 4, 3, 3],
    dessin: { forme: 'coeur', n: 2, l: 1, w: .62, c: '#121a14', c2: '#24302a', motif: ['nervures', 'velours'], mc: '#d0dad2' }
  }
];

window.FOURNITURES = [
  { id: 'sphaigne', nom: 'Sphaigne du Chili', detail: 'Sachet de 1 L, fibres longues', prix: 6.5 },
  { id: 'porte-tubes', nom: 'Porte-tubes en chêne', detail: '3 places, vis en laiton', prix: 24 },
  { id: 'etiquettes', nom: 'Étiquettes en zinc', detail: 'Lot de 10, à graver au crayon', prix: 8 },
  { id: 'liege', nom: 'Planche de liège naturel', detail: '30 cm, pour les plantes en écailles', prix: 12 },
  { id: 'gel', nom: 'Gel de bouturage', detail: 'Flacon de 25 ml', prix: 7 }
];

// Rich mock data for comprehensive testing
const DATA = {
  featured: [
    {id:'g1', title:'CyberFarm 2077', developer:'AcmeSoft', price:29.99, rating:4.4, tags:['RPG','Open World'], cover:'https://picsum.photos/seed/cf/800/400', media:[{t:'img',src:'https://picsum.photos/seed/cf1/900/500'},{t:'img',src:'https://picsum.photos/seed/cf2/900/500'},{t:'vid',src:'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'}], description:'Hack tractors. Romance androids. Grow neon wheat in a dystopian future where agriculture meets cybernetics.', dlc:[{id:'d1',title:'Neon Harvest',price:9.99},{id:'d4',title:'Android Companions',price:14.99}], related:['g2','g3'], reviews:1247, positive:89, achievements:42, languages:['English','Spanish','French','German','Japanese'], requirements:'OS: Windows 10, Processor: Intel i5-8400, Memory: 8 GB RAM, Graphics: GTX 1060'},
    {id:'g2', title:'Dungeon DEX', developer:'CardForge', price:19.99, rating:4.1, tags:['Deckbuilder','Roguelike'], cover:'https://picsum.photos/seed/dx/800/400', media:[{t:'img',src:'https://picsum.photos/seed/dx1/900/500'},{t:'img',src:'https://picsum.photos/seed/dx2/900/500'}], description:'Roguelike deckbuilder with procedural bosses and infinite replayability.', dlc:[], related:['g1'], reviews:892, positive:84, achievements:28, languages:['English','Spanish','French'], requirements:'OS: Windows 10, Processor: Intel i3-6100, Memory: 4 GB RAM, Graphics: GTX 750 Ti'},
    {id:'g3', title:'SkyRails Tycoon', developer:'Vectra', price:24.99, rating:4.7, tags:['Simulation','Strategy'], cover:'https://picsum.photos/seed/sr/800/400', media:[{t:'img',src:'https://picsum.photos/seed/sr1/900/500'},{t:'img',src:'https://picsum.photos/seed/sr2/900/500'}], description:'Build floating rail networks across a shattered world. Manage resources, design routes, and connect isolated settlements.', dlc:[{id:'d2',title:'Isle of Giants',price:7.99}], related:['g1'], reviews:2156, positive:94, achievements:35, languages:['English','Spanish','French','German','Chinese'], requirements:'OS: Windows 10, Processor: Intel i5-6600, Memory: 6 GB RAM, Graphics: GTX 960'},
    {id:'g4', title:'Mechball', developer:'OrbitalPlay', price:14.99, rating:3.9, tags:['Sports','Action'], cover:'https://picsum.photos/seed/mb/800/400', media:[{t:'img',src:'https://picsum.photos/seed/mb1/900/500'}], description:'Rocket-powered mechs play future ball in zero-gravity arenas.', dlc:[], related:['g2'], reviews:543, positive:76, achievements:18, languages:['English','Spanish'], requirements:'OS: Windows 10, Processor: Intel i3-8100, Memory: 4 GB RAM, Graphics: GTX 1050'},
    {id:'g8', title:'Quantum Heist', developer:'NeonStudio', price:34.99, rating:4.5, tags:['Action','Stealth'], cover:'https://picsum.photos/seed/qh/800/400', media:[{t:'img',src:'https://picsum.photos/seed/qh1/900/500'}], description:'Master quantum mechanics to pull off impossible heists across parallel dimensions.', dlc:[{id:'d5',title:'Multiverse Pack',price:12.99}], related:['g1','g5'], reviews:1834, positive:91, achievements:38, languages:['English','French','German','Japanese'], requirements:'OS: Windows 10, Processor: Intel i7-8700, Memory: 12 GB RAM, Graphics: RTX 2060'},
    {id:'g9', title:'Neon Nights', developer:'CyberDev', price:22.99, rating:4.2, tags:['RPG','Cyberpunk'], cover:'https://picsum.photos/seed/nn/800/400', media:[{t:'img',src:'https://picsum.photos/seed/nn1/900/500'}], description:'Navigate the neon-soaked streets of Neo Tokyo in this cyberpunk RPG.', dlc:[], related:['g1'], reviews:967, positive:87, achievements:31, languages:['English','Japanese','Korean'], requirements:'OS: Windows 10, Processor: Intel i5-9400, Memory: 8 GB RAM, Graphics: GTX 1660'}
  ],
  new: [
    {id:'g5', title:'StarForge: Exodus', developer:'NovaWorks', price:39.99, rating:4.6, tags:['Action','RPG'], cover:'https://picsum.photos/seed/sf/800/400', media:[{t:'vid',src:'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'},{t:'img',src:'https://picsum.photos/seed/sf1/900/500'}], description:'Loot, shoot, and explore the rim worlds.', dlc:[], related:['g1','g2']},
    {id:'g6', title:'Pixel Chef Ultra', developer:'ByteBistro', price:9.99, rating:4.0, tags:['Indie','Sim'], cover:'https://picsum.photos/seed/pc/800/400', media:[{t:'img',src:'https://picsum.photos/seed/pc1/900/500'}], description:'Cook chaos in 8-bit kitchens.', dlc:[], related:['g4']}
  ],
  topsellers: [
    {id:'g7', title:'Mythfall Online', developer:'Colossus', price:49.99, rating:4.3, tags:['MMO','RPG'], cover:'https://picsum.photos/seed/mo/800/400', media:[{t:'img',src:'https://picsum.photos/seed/mo1/900/500'}], description:'Epic raids and realm wars.', dlc:[{id:'d3',title:'Champion Pack',price:14.99}], related:['g1']},
    {id:'g3', title:'SkyRails Tycoon', developer:'Vectra', price:24.99, rating:4.7, tags:['Sim','Builder'], cover:'https://picsum.photos/seed/sr/800/400', media:[{t:'img',src:'https://picsum.photos/seed/sr1/900/500'}], description:'Build floating rail networks across a shattered world.', dlc:[{id:'d2',title:'Isle of Giants',price:7.99}], related:['g1']}
  ],
  specials: [
    {id:'g2', title:'Dungeon DEX', developer:'CardForge', price:9.99, rating:4.1, tags:['Deckbuilder','Rogue'], cover:'https://picsum.photos/seed/dx/800/400', media:[{t:'img',src:'https://picsum.photos/seed/dx1/900/500'}], description:'Roguelike deckbuilder with procedural bosses.', dlc:[], related:['g1']},
    {id:'g4', title:'Mechball', developer:'OrbitalPlay', price:4.99, rating:3.9, tags:['Sports','Action'], cover:'https://picsum.photos/seed/mb/800/400', media:[{t:'img',src:'https://picsum.photos/seed/mb1/900/500'}], description:'Rocket-powered mechs play future ball.', dlc:[], related:['g2']}
  ],
  library: [
    {id:'g2', installed:true, hours:42, lastPlayed:'2025-08-01', achievements:18, totalAchievements:28, cloudSync:true, controllerSupport:true, updateAvailable:false},
    {id:'g1', installed:false, hours:5, lastPlayed:'2025-07-20', achievements:8, totalAchievements:42, cloudSync:true, controllerSupport:true, updateAvailable:false},
    {id:'g3', installed:false, hours:0, lastPlayed:null, achievements:0, totalAchievements:35, cloudSync:true, controllerSupport:false, updateAvailable:false},
    {id:'g4', installed:true, hours:12, lastPlayed:'2025-07-28', achievements:12, totalAchievements:18, cloudSync:false, controllerSupport:true, updateAvailable:true},
    {id:'g8', installed:true, hours:67, lastPlayed:'2025-08-09', achievements:31, totalAchievements:38, cloudSync:true, controllerSupport:true, updateAvailable:false},
    {id:'g9', installed:false, hours:0, lastPlayed:null, achievements:0, totalAchievements:31, cloudSync:true, controllerSupport:false, updateAvailable:false}
  ],
  friends: [
    {id:'f1', name:'Ari', status:'Online', game:'CyberFarm 2077', avatar:'https://picsum.photos/seed/ari/64/64'},
    {id:'f2', name:'Sam', status:'In Game', game:'Quantum Heist', avatar:'https://picsum.photos/seed/sam/64/64'},
    {id:'f3', name:'Jess', status:'Away', game:null, avatar:'https://picsum.photos/seed/jess/64/64'},
    {id:'f4', name:'Alex', status:'Online', game:null, avatar:'https://picsum.photos/seed/alex/64/64'},
    {id:'f5', name:'Morgan', status:'Offline', game:null, avatar:'https://picsum.photos/seed/morgan/64/64'},
    {id:'f6', name:'Casey', status:'In Game', game:'SkyRails Tycoon', avatar:'https://picsum.photos/seed/casey/64/64'}
  ],
  community: {
    discussions: [
      {id:'d1', title:'Best CyberFarm 2077 Build Guide', author:'ProGamer2025', replies:47, likes:234, game:'CyberFarm 2077', timestamp:'2 hours ago'},
      {id:'d2', title:'SkyRails Tycoon Tips for Beginners', author:'RailMaster', replies:23, likes:156, game:'SkyRails Tycoon', timestamp:'5 hours ago'},
      {id:'d3', title:'Quantum Heist Speedrun World Record', author:'SpeedDemon', replies:89, likes:567, game:'Quantum Heist', timestamp:'1 day ago'}
    ],
    workshop: [
      {id:'w1', title:'Cyberpunk UI Overhaul', author:'ModMaster', downloads:12543, rating:4.8, game:'CyberFarm 2077', thumbnail:'https://picsum.photos/seed/mod1/200/150'},
      {id:'w2', title:'Realistic Physics Pack', author:'PhysicsGuru', downloads:8934, rating:4.6, game:'Mechball', thumbnail:'https://picsum.photos/seed/mod2/200/150'},
      {id:'w3', title:'Extended Rail Networks', author:'TrackBuilder', downloads:15672, rating:4.9, game:'SkyRails Tycoon', thumbnail:'https://picsum.photos/seed/mod3/200/150'}
    ],
    guides: [
      {id:'gu1', title:'Complete Achievement Guide - CyberFarm 2077', author:'AchievementHunter', views:45623, rating:4.7, game:'CyberFarm 2077'},
      {id:'gu2', title:'Advanced Deckbuilding Strategies', author:'CardMaster', views:23456, rating:4.5, game:'Dungeon DEX'},
      {id:'gu3', title:'Optimal Route Planning in SkyRails', author:'EfficiencyExpert', views:34567, rating:4.8, game:'SkyRails Tycoon'}
    ]
  }
};


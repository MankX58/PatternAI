fetch('https://freesewing.eu/designs').then(r=>r.text()).then(t=>{
  const matches = t.match(/<img[^>]+src=\"([^\"]+)\"/g);
  console.log(matches ? matches.slice(0, 10) : 'none');
}).catch(console.error);

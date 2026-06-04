fetch('https://freesewing.eu/designs/aaron').then(r=>r.text()).then(t=>{
  const matches = t.match(/src="([^"]+aaron[^"]+)"/ig);
  console.log(matches);
}).catch(console.error);

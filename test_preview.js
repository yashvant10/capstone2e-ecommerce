fetch('http://localhost:4173/').then(r => r.text()).then(t => console.log(t.substring(0, 1500))).catch(console.error);

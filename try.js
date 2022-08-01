list = [
    {id:10, val:"a"},
    {id:1.1, val:"b"},
    {id:3, val:"c"},
    {id:4, val:"c"},

];

var result = [];

result = list.sort((a,b) => (a.id > b.id? 0:-1));
console.log(result);

result = list.sort((a,b) => (a.id - b.id));
console.log(result);

result = list.sort((a,b) => (a.val < b.val? 1:-1));
console.log(result);

result = list.sort((a,b) => (a.val <= b.val? 1:-1));
console.log(result);

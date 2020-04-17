const fs = require("fs");
const inquirer = require("inquirer");
const axios = require("axios");

const fileName='output.md';
const gitusername='jo3005';
const gitpassword='';
const gitrepository='';


inquirer
  .prompt({
    message: "Enter your GitHub username:",
    name: "username"
  })
  .then(function({ username }) {
    const queryUrl = `https://api.github.com/users/${username}/repos?per_page=100`;

    axios.get(queryUrl).then(function(res) {
      const repoNames = res.data.map(function(repo) {
        return repo.name;
      });

      const repoNamesStr = repoNames.join("\n");

      fs.writeFile("repos.txt", repoNamesStr, function(err) {
        if (err) {
          throw err;
        }

        console.log(`Saved ${repoNames.length} repos`);
      });
    });
  });



const readme={
    filename: fileName,
    title:'#'+ process.argv[2] +'\n',
    description: '#Description' +'\n'+ ''+'\n',
    contents: '#Table of Contents' +'\n'+ ''+'\n',
    installation: '#Installation'+'\n'+ ''+'\n',
    usage:'#Usage'+'\n'+ ''+'\n',
    license: '#Licence'+'\n'+ ''+'\n',
    contributing: '#Contributing'+'\n'+ ''+'\n',
    tests: '#Tests'+'\n'+ ''+'\n',
    questions: '#Questions'+'\n'+ ''+'\n'
}


// Create new readme file
fs.writeFile(readme.filename, '', function(err) {

  if (err) {
    return console.log(err);
  }

  console.log("New file created!");

});

fs.appendFile(readme.filename,readme.title,function(err){
    if (err) {
        return console.log(err);
      }
    
      console.log("Title added");
});
fs.appendFile(readme.filename,readme.description,function(err){
    if (err) {
        return console.log(err);
      }
    
      console.log("Description added");
}); 
fs.appendFile(readme.filename,readme.contents,function(err){
    if (err) {
        return console.log(err);
      }
    
      console.log("Table of Contents added");
});





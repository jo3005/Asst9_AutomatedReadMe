const fs = require("fs");
const inquirer = require("inquirer");
const axios = require("axios");

const fileName='output.md';
var gitusername='';
const gitpassword='';
var gitrepository='';

//Get Licence options before starting
const licence_names=axios.get(`https://api.github.com/licenses`)
        .then(function(res) {
            const licNames = res.data.map(function(lic) {
                return lic.name;
                })
            return licNames;
            })
        .then(function(licNames){
            inquirer.prompt([
                {   type: "input",
                    message: "Enter your GitHub username:",
                    name: "username",
                    default: "jo3005"
                },
                {
                    type: "input",
                    message: "Enter your new repository name:",
                    name: "repository",
                    default: "automated_readme"
                },
                {
                    type: "input",
                    message: "Enter a short title for your project:",
                    name: "title",
                    default: "Automated Readme File Generator"
                },
                {
                    type: "input",
                    message: "Enter a description of your repository:",
                    name: "description",
                    default: "This repo contains code that creates a Readme.md file for a new github repository"
                },
                {
                    type: "input",
                    message: "Enter your installation guidelines:",
                    name: "installation",
                    default: "Installation guidelines have not yet been defined."
                },
                {
                    type: "input",
                    message: "Enter your usage guidelines:",
                    name: "usage",
                    default: "Usage guidelines have not yet been defined."
                },
                {
                    type: "list",
                    message: "Select a licence type:",
                    name: "licence",
                    choices: licNames
                },
                {
                    type: "list",
                    message: "How can users contribute:",
                    name: "contributing",
                    choices:["1. No contribution allowed",
                            "2. As per the Contributor Covenant v2.0",
                            "3. Other"],
                    default: "3. Other"
                },
                {
                    type: "input",
                    message: "Enter the contributing text:",
                    name: "contributing_text",
                    when: function(answers){
                        return(answers.contributing==="3. Other")
                    }
                  
                },
                {
                    type: "input",
                    message: "Enter any test information:",
                    name: "tests",
                    default: "No test information is available at this time."
            
                },
                {
                    type: "input",
                    message: "Enter any questions text:",
                    name: "questions",
                    default:"No question information is available at this time."
                }
            ])
            .then(data => {
                //console.log(data);
                gitusername=data.username;
                gitrepository=data.repository;
                let cont_text = '';
                let toc_contents='';
                function get_cont_text(data){
                    const whichcontributing = data.contributing;
                    
                    const cont_number = data.contributing.substring(0,1);
                    
                    switch(cont_number) {
                        case "1": // no contributing 
                            return data.contributing.substring(2);
                            break;
                        case "2": // 'As per the Contributor Covenant v2.0'
                            return data.contributing.substring(2) + '. For more details go to ' + 'http://www.contributor-convenant.org';
                            break;
                        case "3":
                            return data.contributing_text;
                            break;
                        default:
                            return 'No contributing information is available at this time';
                    }
                    
                };

                function create_toc(data){
                    let readmeKeys= '';
                    Object.keys(data).forEach(function(key){
                        let newkey=key;
                        const ignore=['username','title','description','contributing_text','repository']
                        //console.log(newkey);
                        if(ignore.indexOf(newkey) == -1){
                            
                            readmeKeys=readmeKeys + '\n * [' + newkey.charAt(0).toUpperCase() + newkey.slice(1) + '](#' + newkey + ')';
                        }
                        
                  })
                  return readmeKeys;
                };

                cont_text=get_cont_text(data);
                toc_contents = create_toc(data);

                console.log(toc_contents);

                const readmeData={
                    title:'#'+ data.title +' \n',
                    description: '##Description ' +' \n'+ data.description +' \n',
                    contents: '##Table of Contents ' +' \n'+ toc_contents +' \n',
                    installation: '##Installation <a name="installation"></a>'+'\n'+ data.installation +' \n',
                    usage:'##Usage <a name="usage"></a>'+'\n'+ data.usage +' \n',
                    license: '##Licence <a name="licence"></a>'+'\n'+ data.licence +' \n',
                    contributing: '##Contributing <a name="contributing"></a>'+' \n'+ cont_text +' \n',
                    tests: '##Tests <a name="tests"></a>'+'\n'+ data.tests +' \n',
                    questions: '##Questions <a name="questions"></a>'+' \n'+ data.questions +' \n'
                }; 
                //console.log(readmeData);
                return readmeData;
              })
              .then(data => {
                 //console.log(data);
                  let readmeText= '';
                  Object.values(data).forEach(function(value){
                    const newtext=value;
                    console.log(newtext);
                    readmeText=readmeText + '\n' + newtext;
                  })
                  
                  return readmeText;
              })
              .then(readmeText => {
                fs.writeFile(fileName, readmeText, function(err) {

                    if (err) {
                      return console.log(err);
                    }
                  
                    console.log("New file created!");
                  
                  });
              })
              .catch(error => {
                console.log(error)
              });




        }) 
    ; 









/* 
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
 */




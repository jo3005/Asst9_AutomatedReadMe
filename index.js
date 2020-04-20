const BG=require ('./lib/badge.js');

const fs = require("fs");
const inquirer = require("inquirer");
const axios = require("axios");

const fileName='./output/README.md';
var gitusername='';
var gitrepository='';

let git_email='';

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
                {   type: "input",
                    message: "Enter your GitHub email:",
                    name: "email",
                    default: "joanna.sikorska@uwa.edu.au"
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
                    default: "This repo contains code that creates a Readme.md file for a new github repository."
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
                    choices:["1. No contribution allowed.",
                            "2. As per the Contributor Covenant v2.0.",
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
                }
            ])
            .then(data => {
                //console.log(data);
                gitusername=data.username;
                gitrepository=data.repository;
                git_email=data.email;
                let cont_text = '';
                let toc_contents='';
                let badges_content='';
                let readmedata='';
                
                function get_cont_text(data){
                    const whichcontributing = data.contributing;
                    
                    const cont_number = data.contributing.substring(0,1);
                    
                    switch(cont_number) {
                        case "1": // no contributing 
                            return data.contributing.substring(2);
                            //break;
                        case "2": // 'As per the Contributor Covenant v2.0'
                            return data.contributing.substring(2) + '. For more details go to ' + 'http://www.contributor-convenant.org';
                            //break;
                        case "3":
                            if (data.contributing_text ===''){
                                return 'No contributing information is available at this time.'
                            } else {
                                return data.contributing_text
                            };
                            //break;
                        default:
                            return 'No contributing information is available at this time.';
                    }
                    
                };

                function create_toc(data){
                    let readmeKeys= '';
                    Object.keys(data).forEach(function(key){
                        let newkey=key;
                        const ignore=['username','title','description','contributing_text','repository','email']
                        //console.log(newkey);
                        if(ignore.indexOf(newkey) == -1){
                            
                            readmeKeys=readmeKeys + '\n * [' + newkey.charAt(0).toUpperCase() + newkey.slice(1) + '](#' + newkey + ')';
                        }
                        
                  })
                  return readmeKeys;
                };

                function get_links(gituser,data){
                    let links_text= `Github repo url: https://github.com/${gituser}/${data.repository}\n`;
                    links_text=links_text + `Deployed url: https://${gituser}.github.io/${data.repository}`;
                    return links_text;
                }

                function make_badges(){
                    const badges=[];
                    //licence badge
                    let newBadge=new BG({
                        label : 'Licence',
                        message : `${data.licence.replace(/ /g,'%20')}`,
                        color : 'blue'});
                    
                    badges.push(newBadge);

                    /* newBadge= new BG({
                        label : 'axios',
                        message : JSON.parse(fs.readFileSync('package.json', 'utf8')).dependencies.axios,
                        color : 'green'
                        });
                    badges.push(newBadge);
                    
                    newBadge= new BG({
                        label : 'inquirer',
                        message : JSON.parse(fs.readFileSync('package.json', 'utf8')).dependencies.inquirer,
                        color : 'green'
                        });
                    badges.push(newBadge); */
                    
                    return badges;
                };

                function get_badge_string(){
                    const badges_array = make_badges();
                    let badge_string='';

                    badges_array.forEach(value=> {
                        const newbadgestring=value.makeURL();
                        badge_string= badge_string + `  ![${value.label}](${newbadgestring})`;

                    })
                    return badge_string + '\n';
                }

                function format_readme(gituser,data,cont_text,toc_contents,badges_content){
                    const queryURL=`https://api.github.com/users/${gituser}`;
                    
                    const userdata=axios.get(queryURL)
                        .then(function(res) {
                            const user_data={
                                name: res.data.name,
                                avatar:res.data.avatar_url,
                                email:git_email
                            }
                            return user_data;
                        })
                        .then(gitdata =>{
                            // Format data for the links to be included
                            const links_text=get_links(gitusername,data);
                            
                            //Format data for the questions section to be included
                            const questions= `Contact: ${gitdata.name} <img src="${gitdata.avatar}" width="50" height="50"></img> \n Email: ${gitdata.email}`;
                            let includeBadges=get_badge_string();
                            // pool all the data that will be displayed together. This will be written in the next section
                            const readmeData={
                                title:'#'+ data.title +' \n' + badges_content + ' \n',
                                badges:includeBadges,
                                description: '##Description ' +' \n'+ data.description +' \n',
                                links: '##Links ' + ' \n' + links_text + ' \n ',
                                contents: '##Table of Contents ' +' \n'+ toc_contents +' \n',
                                installation: '##Installation <a name="installation"></a>'+'\n'+ data.installation +' \n',
                                usage:'##Usage <a name="usage"></a>'+'\n'+ data.usage +' \n',
                                license: '##Licence <a name="licence"></a>'+'\n'+ data.licence +' \n',
                                contributing: '##Contributing <a name="contributing"></a>'+' \n'+ cont_text +' \n',
                                tests: '##Tests <a name="tests"></a>'+'\n'+ data.tests +' \n',
                                questions: '##Questions <a name="questions"></a>'+' \n'+ questions +' \n'
                            };
                            
                            return readmeData;
                        });
                    return userdata;    
                };
                cont_text=get_cont_text(data);
                toc_contents = create_toc(data);
                //badges_content=get_badges(data);
                readmedata=format_readme(gitusername,data,cont_text,toc_contents,badges_content);
                //console.log(readmedata);
                return readmedata;
              })
              .then(data => {
                  // Create the string that will be written to file
                
                  let readmeText= '';
                  Object.values(data).forEach(function(value){
                    const newtext=value;
                    readmeText=readmeText + '\n' + newtext;
                  })
                  return readmeText;
              })
              .then(readmeText => {
               //Write this string to the file
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




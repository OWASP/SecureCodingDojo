/**

Copyright 2017-2018 Trend Micro

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this work except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

 */
const path = require("path");
const db = require(path.join(__dirname, "db"));
const util = require(path.join(__dirname, "util"));

exports.parseReportCSV = (csvData) => {
    if(util.isNullOrUndefined(csvData)) return null;
    
    var reportUsers = null;
    let csvText = Buffer.from(csvData).toString();
    //load the CSV
    if(!util.isNullOrUndefined(csvText)){
      //split the csv into lines
      reportUsers = {"totalMembers":0,"inProgressMembers":0,"completeMembers":0,"teamList":[]};
      var lines = csvText.split("\n");
      var linesCount = lines.length;
      if(linesCount > 1){
        var teams = lines[0].trimRight().split(",");
        var teamsCount = teams.length;
        if(teamsCount>=1){
          
          for(var idx=0; idx<teamsCount; idx++){
            reportUsers.teamList[idx]={"team":teams[idx], "completed": 0, "members": []};
          }
  
          for(var idx1=1;idx1<linesCount;idx1++){
            var rowMembers = lines[idx1].trimRight().split(",");
  
            for(var idx2=0; idx2<teamsCount; idx2++){
              
              if(rowMembers[idx2].length>0){
                reportUsers.teamList[idx2].members.push({"name":rowMembers[idx2].trim(),"status":"Not Started"});
                reportUsers.totalMembers++;
               
              }
            }
          }
        }
      }
    }
    return reportUsers;
  }
  
  exports.getReportForModuleId = async (reportUsers, requiredModule) => {
  
    //update the user status based on the users in the database
    reportUsers.completeMembers = 0;
    reportUsers.incompleteMembers = 0;
  
    let dbUsers = await db.getAllUsersForBadge(requiredModule);
    for(let team of reportUsers.teamList){
      team.completed = 0;
      team.percentComplete = 0;
      for(let member of team.members){
        member.status="Not Started";
  
        for(let dbUser of dbUsers){
          //check if the dbUser name matches
          let reportName = member.name.toLowerCase().trim();
          let dbUserGivenName = dbUser.givenName.toLowerCase().trim();
          //strip middle names
          let givenNames = dbUserGivenName.split(' ');
          if(givenNames.length>1){
            dbUserGivenName = givenNames[0];
          }
          let dbUserFamilyName = dbUser.familyName.toLowerCase().trim();
  
          if(reportName.indexOf(dbUserGivenName)===0 && reportName.indexOf(dbUserFamilyName) >= 0){
            member.status="Complete";
            break;
          }
        }
  
        if(member.status==="Complete"){
          reportUsers.completeMembers++;
          team.completed++;
        }
        else{
          reportUsers.incompleteMembers++;
        }
          
  
      }
      team.percentComplete = Math.round((team.completed/team.members.length) * 100);
  
    }
  
    reportUsers.percentComplete = Math.round((reportUsers.completeMembers/reportUsers.totalMembers) * 100);
    reportUsers.status = 200;
  
    return reportUsers;
  
  }
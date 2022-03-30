'use strict';

const mongoose = require('moongoose');
const Issue = require('../models').Issue;
const Project = require('../models').Project;

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;

      let _id = req.query._id;

      let issue_title = req.query.issue_title;
      let issue_text = req.query.issue_text;
      let created_by = req.query.created_by;
      let assigned_to = req.query.assigned_to;
      let status_text = req.query.status_text;

      if(req.query.open == 'true') {
        var open = true;
      }
      else if(req.query.open == 'false') {
        var open = false;
      }

      // console.log('req.query: ');
      // console.log(req.query);

      Project
        .aggregate([
        {$match: {name: project}},
        {$unwind: '$issues'},
        // _id != undefined
        //   ? {$match: {'issues._id': _id}}
        //   : {$match: {}},
        issue_title != undefined
          ? {$match: {'issues.issue_title': issue_title}}
          : {$match: {}},
        issue_text != undefined
          ? {$match: {'issues.issue_text': issue_text}}
          : {$match: {}},
        created_by != undefined
          ? {$match: {'issues.created_by': created_by}}
          : {$match: {}},
        assigned_to != undefined
          ? {$match: {'issues.assigned_to': assigned_to}}
          : {$match: {}},
        status_text != undefined
          ? {$match: {'issues.status_text': status_text}}
          : {$match: {}},
        open != undefined
          ? {$match: {'issues.open': open}}
          : {$match: {}}
        ])
        .exec(function (err, data) {
          if(!data) {
            res.json([]);
          }
          else {
            if(_id != undefined) {
              // console.log('test:');
              // console.log(_id);
              data = data.filter((d) => {
                if(d.issues._id.toString() == _id) {
                  // console.log('yes');
                  return true;
                }
                return false;
              });
            }

            let filteredData = data.map(d => d.issues);

            // console.log('GET');
            // console.log(filteredData);

            res.json(filteredData);
          }
        });
    })
    
    .post(function (req, res){
      let project = req.params.project;
      
      //Save input to schema
      let issue_title = req.body.issue_title;
      let issue_text = req.body.issue_text;
      let created_by = req.body.created_by;
      let assigned_to = req.body.assigned_to;
      let status_text = req.body.status_text;

      let created_on = new Date;
      let updated_on = new Date;
      let open = true;

      if(issue_title != undefined && issue_text != undefined && created_by != undefined) {

        // console.log('Creating new issue');
      
        //Create a new issue
        const newIssue = new Issue({
          issue_title: issue_title || "",
          issue_text: issue_text || "",
          created_on: created_on.toISOString(),
          updated_on: updated_on.toISOString(),
          created_by: created_by || "",
          assigned_to: assigned_to || "",
          open: open,
          status_text: status_text || ""
        });

        Project.findOne({name: project}, function (err, data) {
          
          // console.log("Finding project");
          
          if(!data) {

            // console.log('New Project');
            
            const newProject = new Project({name: project});
            newProject.issues.push(newIssue);
            newProject.save(function (err, data) {
              if(err) {
                console.log(err);
                return res.json({error_message: err});
              }
              else {
                return res.json({
                  _id: newIssue._id,
                  issue_title: newIssue.issue_title,
                  issue_text: newIssue.issue_text,
                  created_on: newIssue.created_on,
                  updated_on: newIssue.updated_on,
                  created_by: newIssue.created_by,
                  assigned_to: newIssue.assigned_to,
                  open: newIssue.open,
                  status_text: newIssue.status_text
                });
              }
            });
          }
          else {

            // console.log('Found Project');
            // console.log(data);
            
            data.issues.push(newIssue);
            data.save(function (err, data) {
              if(err) {
                console.log(err);
                return res.json({error_message: err});
              }
              else {
                return res.json({
                  _id: newIssue._id,
                  issue_title: newIssue.issue_title,
                  issue_text: newIssue.issue_text,
                  created_on: newIssue.created_on,
                  updated_on: newIssue.updated_on,
                  created_by: newIssue.created_by,
                  assigned_to: newIssue.assigned_to,
                  open: newIssue.open,
                  status_text: newIssue.status_text
                });
              }
            });
          }
        });
      }
      else {
        return res.json({error: 'required field(s) missing'});
      }              
    })
    
    .put(function (req, res){
      let project = req.params.project;

      // console.log('PUT');
      // console.log(req.body);

      if(!req.body._id) {
        // console.log('missing_id');
        return res.json({error: 'missing _id'});
      }

      if(
        !req.body.issue_title && 
        !req.body.issue_text &&
        !req.body.created_by &&
        !req.body.assigned_to &&
        !req.body.status_text &&
        !req.body.open) 
      {
        // console.log({error: 'no update field(s) sent', _id: req.body._id});
        return res.json({error: 'no update field(s) sent', _id: req.body._id});
      }
      
      Project.findOne({name: project}, function(err, data) {
        // console.log(data);

        if(err || !data) {
          // console.log({error1: 'could not update', _id: req.body._id});
          return res.json({error: 'could not update', _id: req.body._id});
        }

        let updatedIssue = data.issues.id(req.body._id);

        if(!updatedIssue) {
          // console.log({error2: 'could not update', _id: req.body._id});
          return res.json({_id: req.body._id, error: 'could not update'});
        }

        let updated_on = new Date;

        updatedIssue.updated_on = updated_on.toISOString();

        updatedIssue.issue_title = req.body.issue_title || updatedIssue.issue_title;
        updatedIssue.issue_text = req.body.issue_text || updatedIssue.issue_text;
        updatedIssue.created_by = req.body.created_by || updatedIssue.created_by;
        updatedIssue.assigned_to = req.body.assigned_to || updatedIssue.assigned_to;
        updatedIssue.status_text = req.body.status_text || updatedIssue.status_text;
        
        

        // if(req.body.issue_title != '') {
        //   updatedIssue.issue_title = req.body.issue_title;
        //   updatedIssue.updated_on = updated_on.toISOString();
        // }
        // if(req.body.issue_text != '') {
        //   updatedIssue.issue_text = req.body.issue_text;
        //   updatedIssue.updated_on = updated_on.toISOString();
        // }
        // if(req.body.created_by != '') {
        //   updatedIssue.created_by = req.body.created_by;
        //   updatedIssue.updated_on = updated_on.toISOString();
        // }
        // if(req.body.assigned_to != '') {
        //   updatedIssue.assigned_to = req.body.assigned_to;
        //   updatedIssue.updated_on = updated_on.toISOString();
        // }
        // if(req.body.status_text != '') {
        //   updatedIssue.status_text = req.body.status_text;
        //   updatedIssue.updated_on = updated_on.toISOString();
        // }

        if(req.body.open == undefined) {
          updatedIssue.open = true;
        }
        else {
          updatedIssue.open = false;
        }
        
        // console.log(updatedIssue);

        data.save(function (err, data) {
          if(err) {
            console.log('err3: ' + err);
            return res.json({error: 'could not update', _id: req.body._id});
          }
          else {
            // console.log({result: 'successfully updated', _id: req.body._id});
            // console.log(data.issues.id(req.body._id));
            return res.json({result: 'successfully updated', _id: req.body._id});
          }
        });
      });
    })
    
    .delete(function (req, res){
      let project = req.params.project;

      // console.log('DELETE');
      // console.log(req.body);

      //Check for blank id field
      if(!req.body._id) {
        // console.log('missing_id');
        return res.json({error: 'missing _id'});
      }
      
      Project.findOne({name: project}, function (err, data) {

        if(!data.issues.id(req.body._id)) {
          // console.log({error1: 'could not delete', _id: req.body._id});
          return res.json({error: 'could not delete', _id: req.body._id});
        }

        //console.log(data.issues.filter(d => d._id.toString() != req.body._id));

        data.issues = data.issues.filter(d => d._id.toString() != req.body._id);


        data.save(function (err, data) {
          if(err) {
            // console.log({error2: 'could not delete', _id: req.body._id});
            return res.json({error: 'could not delete', _id: req.body._id});
          }
          else {
            // console.log({result: 'successfully deleted', _id: req.body._id})
            return res.json({result: 'successfully deleted', _id: req.body._id});
          }
        });
      });
    });
};

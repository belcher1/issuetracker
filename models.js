//Require mongoose
const mongoose = require('mongoose');

//Create a schema
const Schema = mongoose.Schema;

const issueSchema = new Schema ({
  issue_title: {type: String, required: true},
  issue_text: {type: String, required: true},
  created_on: {type: Date},
  updated_on: {type: Date},
  created_by: {type: String, required: true},
  assigned_to: {type: String},
  open: {type: Boolean},
  status_text: {type: String}
});

const Issue = mongoose.model('Issue', issueSchema);

const projectSchema = new Schema ({
  name: {type: String, required: true},
  issues: [issueSchema]
});

const Project = mongoose.model('Project', projectSchema);

exports.Issue = Issue;
exports.Project = Project;
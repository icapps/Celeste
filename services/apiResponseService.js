exports.sendResponse = function(req,res,err,errMessage,results){
	if(err)res.status(400).send(errMessage,err);
	else res.status(200).send(results);
};

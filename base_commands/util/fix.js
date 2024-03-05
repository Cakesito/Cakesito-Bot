module.exports = any => { 
    any.userId = any.author ? any.author.id : any.user.id;
    any.user = any.author ?? any.user;
    any.author = any.user ?? any.author

    return any;
}
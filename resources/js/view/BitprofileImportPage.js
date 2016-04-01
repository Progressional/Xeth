var BitprofileImportPageView = SubPageView.extend({

    initialize:function(options){
        _(this).bindAll("render", "submit");
		SubPageView.prototype.initialize.call(this,options);
        this.template = options.templates.get("import_bitprofile");
        this.$el.html(this.template());
        this.filesystem = options.filesystem;
        this.profiles = options.profiles;
        this.$el.find(".btn.browse").click(this.render);
        this.$el.find(".btnSubmit").click(this.submit);
        this.fileInput = this.$el.find("#importBitprofile_address");
        this.router = options.router;
    },

    render:function(){
        this.filename = this.filesystem.browse({type:"open"});
        this.fileInput.val(this.filename||"");
    },

    submit:function(){
        if(!this.filename){
            notifyError("please select a file");
            return false;
        }
        var password = this.$el.find("#importBitprofile_password");
        if(!password.validate()){
            notifyError("password is required");
            return false;
        }
        var profile = this.profiles.importKey(this.filename, password.val());
        if(!profile){
            notifyError("failed to import key, file is corrupted or invalid password");
            return false;
        }
        notifySuccess("bitprofile imported");
        //this.router.redirect("bitprofile",{subpage:"view"});
        return true;
    }

});
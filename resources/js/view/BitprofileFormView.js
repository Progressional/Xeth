var BitprofileFormView = SubPageView.extend({

    initialize:function(options){
        _(this).bindAll("submitDetails", "submit", "resetForm", "reset", "lockPage", "updateFeeFactor", "renderDetailsPage");
		SubPageView.prototype.initialize.call(this,options);
        this.template = options.templates.get("bitprofile_form");
        this.$el = $('<div class="bitprofileForm">'+this.template()+'</div>');
        this.accounts = options.accounts;
        this.detailsPage = this.$el.find("#bitporfileCreate_details");
        this.paymentPage = this.$el.find("#bitporfileCreate_payment");
        this.feeFactor = this.$el.find('.section_fee .slider');
        this.feeHolder = this.$el.find(".fee .eth");
        this.gasHolder = this.$el.find(".fee .gas");
        this.password = this.$el.find("#bitprofileCreate_password");
        this.bitprofileId = this.$el.find("#bitprofileCreate_id");
        this.name = this.detailsPage.find("input.name");
        this.avatar = this.detailsPage.find("input.avatarURL");
        this.avatarImage = this.detailsPage.find(".avatar img");
        this.pending = false;
        this.accountSelect_details = this.$el.find("#bitprofileCreateStealthList");
        this.accountSelect_payment = this.$el.find("#bitprofileCreateAccountList");
        this.$form = this.paymentPage.find(".formpage");
        this.bitprofileContext = this.$el.find("#bitporfileCreate_context");
        this.bitprofileContext.selectmenu().selectmenu( "widget" ).addClass( "contextSelect" );
        this.feeFactor.slider({value:50, change:this.updateFeeFactor});
        this.listenTo(this.accounts, "change", this.resetAddressError);
        this.$el.find("#bitporfileCreate_details .btnSubmit").click(this.submitDetails);
        this.$el.find("#bitporfileCreate_payment .btnSubmit").click(this.submit);
        this.$el.find("#bitporfileCreate_details .submitCancel").click(this.resetForm);
        this.$el.find("#bitporfileCreate_payment .submitCancel").click(this.renderDetailsPage);
        this.$el.find(".generate a").click(function(){
            console.log("clicked on generate");
            options.router.redirect("generate");
        });
    },

    attach:function(dom){
        this.$el.appendTo(dom);
    },

    onSubmit:function(callback){
        this.submitStrategy = callback;
    },
    setFeeModel:function(feeModel){
        this.feeModel = feeModel;
    },
    setProfileModel:function(profileModel){
        this.model = profileModel;
    },
    renderDetailsPage:function(){
        if(this.accountSelect_details.find(".accountClone").length>0)
        this.accountSelect_details.html('');
        this.account_payment = this.cloneAccount(this.accountSelect_payment);
        
        this.accounts.resize(21);
        this.accounts.compact(true);
        this.accounts.attach(this.accountSelect_details);
        this.accounts.filter(function(model){return model!=undefined&&!model.get("address")&&model.get("stealth");});
        this.accounts.style("mini receive");
        if(this.account_details) this.selectAccount("stealth",this.account_details.get("stealth"));
        
        this.detailsPage.addClass("active");
        this.paymentPage.removeClass("active");
    },

    renderPaymentPage:function(){
        this.accountSelect_payment.html('');
        
        this.account_details = this.cloneAccount(this.accountSelect_details);
        
        this.accounts.resize(14);
        this.accounts.compact(false);
        this.accounts.attach(this.accountSelect_payment);
        this.accounts.filter(function(model){return model!=undefined&&model.get("address");});
        this.accounts.style("mini send");
        if(this.model){
            this.accounts.readonly(true);
            this.selectAccount("address",this.model.get("account"));
        }else{
            if(this.account_payment) this.selectAccount("address",this.account_payment.get("address"));
        }
        this.computeFee();
        this.detailsPage.removeClass("active");
        this.paymentPage.addClass("active");
    },
    
    cloneAccount:function(dom){
        if(dom){
            var currentAccount = '<div class="input accountClone">'+this.accounts.selectedView().$el.html()+'</div>';
            this.accounts.detach();
            dom.html(currentAccount);
        }
        return this.accounts.selected();
    },
    
    selectAccount:function(type,account){
        this.accounts.focus(function(model){ return (model)&&(model.get(type))==account;});
    },
    
    resetAddressError: function(){
        this.accountSelect_payment.noerror();
    },
    render:function(){
        this.resetForm()  
    },
    reset:function(){
        this.renderDetailsPage();
        this.resetForm();
        this.unlockPage();
    },
    resetForm:function(){
        this.account_details = this.account_payment = undefined;
        this.resetAddressError();
        this.bitprofileId.noerror();
        this.password.noerror();
        this.password.val("");
        this.fillForm();  
    },
    fillForm:function(){
        var img;
        if(this.model){
            img = this.model.get("avatar");
            this.bitprofileContext.val(this.model.get("context"));
            this.bitprofileId.val(this.model.get("id"));
            this.name.val(this.model.get("name"));
            this.selectAccount("stealth",this.model.get("payments"));
        }else{
            this.bitprofileContext.prop('selectedIndex', 0);
            this.bitprofileId.val("");
            this.name.val("");
        }
        
        this.avatar.val(img);
        this.avatarImage.attr("src",((img)?img:'img/avatarEmpty.png'));
        this.bitprofileContext.selectmenu( "refresh" );
    },

    updateFeeFactor:function(){
        this.computeFee();
        if(this.feeFactor.slider("value")<45){
            this.feeFactor.addClass("warning");
        }else{
            this.feeFactor.removeClass("warning");
        }
    },

    computeFee: function(){
        var request = this.getFormData();
        request.factor = this.getFeeFactor();
        var result = this.feeModel.estimate(request);
        console.log(result);
        if(result){
            this.gasAmount = result["gas"];
            this.gasPrice = result["price"];
            this.fee = result["fee"];
            this.feeHolder.html(this.fee.substr(0, 15));
            this.gasHolder.html(this.gasAmount);
        }else{
            this.gasAmount = this.gasPrice = undefined;
            this.feeHolder.html("0");
            this.gasHolder.html("0");
        }
    },

    getFeeFactor: function(){
        var gas = this.feeFactor.slider("value");
        return parseInt(gas/50*100); //in percents
    },
    setLockMessage:function(msg){
        this.$el.find(".pending h1").html(msg);
    },
    lockPage:function(msg){
        this.account_payment = this.cloneAccount(this.accountSelect_payment);
        this.pending = true;
        this.$el.addClass("pending");
        this.setLockMessage(msg);
    },
    
    unlockPage:function(){
        this.pending = false;
        this.$el.removeClass("pending");
    },
    
    submitDetails:function(){
        if(!$([this.bitprofileId]).validate()){
            notifyError("please fill all mandatory fields");
            return false;
        }
        if(!this.accounts.selected()){
            notifyError("no stealth address selected");
            return false;
        }
        this.renderPaymentPage();
    },
    
    submit:function(){
        if(!$([this.password]).validate()){
            notifyError("please fill all mandatory fields");
            return false;
        }
        
        var account = this.accounts.selected();
        if(account.get("balance")<parseFloat(this.fee)){
            this.accountSelect_payment.error();
            notifyError("not enough funds");
            return false;
        }
        this.resetAddressError();
        this.$form.addClass("waiting");
        this.submitStrategy();
        this.$form.removeClass("waiting");
    },
    risePasswordError:function(){
      this.password.error();  
    },
    getFormData:function(){
        var request = {account:this.accounts.selected().get("address"), password:this.password.val(), context:this.bitprofileContext.val(), id:this.bitprofileId.val(), stealth:this.account_details.get("stealth")};
        
        if(this.name.val().length>0) request.name = this.name.val();
        if(this.avatar.val().length>0) request.avatar = this.avatar.val();
        if(this.gasPrice!=undefined && this.gasAmount){
            request.price = this.gasPrice;
            request.gas = this.gasAmount;
        }
        return request;
    },
    inProgress:function(){
        return this.pending;
    },
    hasLowFee:function(){
        return this.feeFactor.hasClass("warning");
    }

});
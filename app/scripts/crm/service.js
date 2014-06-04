'use strict';

angular.module("ones.crm.services", [])
        .factory("RelationshipCompanyGroupModel", ["$rootScope", function($rootScope){
            return {
                getFieldsStruct: function(){
                    return {
                        id: {
                            primary: true
                        },
                        name: {},
                        discount: {
                            inputType: "number",
                            max: 100,
                            min: 1,
                            value: 100
                        }
                    };
                }
            };
        }])
        .factory("RelationshipCompanyModel", ["$rootScope", "RelationshipCompanyGroupRes", function($rootScope, RelCompanyGroupRes){
            return {
                getFieldsStruct: function(){
                    return {
                        id: {
                            primary: true
                        },
                        name: {},
                        group: {
                            field: "Group.name",
                            dataSource: RelCompanyGroupRes,
                            inputType: "select"
                        },
                        discount: {},
                        owner: {
                            hideInForm: true,
                            field: "User.truename"
                        },
                        linkMan: {
                            field: "Linkman[0].contact"
                        },
                        mobile: {
                            field: "Linkman[0].mobile"
                        },
                        telephone: {
                            field: "Linkman[0].tel"
                        },
                        qq: {
                            field: "Linkman[0].qq"
                        },                     
                    };
                }
            };
        }])
<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of CommonViewModel
 *
 * @author 志鹏
 */
class CommonViewModel extends ViewModel{
    
//    protected $status_lang = array(
//        "ineffective","effective"
//    );
//    
//    protected $status_class = array(
//        "normal","success"
//    );
    
    protected $workflowAlias;
    
    protected $workflowMainRowField = "id";
    
    public function getIndexArray($data, $value="name", $key="id") {
        if(!$data) {
            return array();
        }
        foreach($data as $k=>$v) {
            $return[$v[$key]] = $v[$value];
        }
        return $return;
    }
    
    public function where($where, $parse = null) {
//        echo substr($this->name, 0, -4);exit;
        if($this->baseModelName) {
            $model = D($this->baseModelName);
        } else {
            $model = D(substr($this->name, 0, -4));
        }
//        echo substr($this->name, 0, -4);exit;
//        print_r($model->fields);
//        var_dump($model->fields["_type"]["deleted"]);
        if($model->fields["_type"]["deleted"]) {
            $where["deleted"] = 0;
        }

        $tmp = $this->viewFields;
        foreach($tmp as $k=>$v) {
            $tmpModel = D($k);
            if($tmpModel->fields["_type"]["deleted"]) {
                if(!is_array($where)) {
                    $tmp = explode("=", $where);
                    $where = array();
                    $where[$tmp[0]] = $tmp[1];
                }
                $where[$k.".deleted"] = 0;
            }
            break;
        }
//        print_r($where);
        return parent::where($where, $parse);
    }
    
    /**
     * @override
     */
    public function select($options = array()) {
        $data = parent::select($options);
        
//        var_dump($this);
        
//        echo $this->getLastSql()."<br />";
        
        if(!$data) {
            return $data;
        }
        foreach($data as $k=>$v) {
            if($v["dateline"]) {
                $data[$k]["dateline_lang"] = date("Y-m-d H:i:s", $v["dateline"]);
            }
//            if(isset($v["status"])) {
//                if(isset($this->status_lang)) {
//                    $data[$k]["status_lang"] = L($this->status_lang[$v["status"]]);
//                }
//                if($this->status_class) {
//                    $data[$k]["status_class"] = $this->status_class[$v["status"]];
//                }
//            }
            if(isset($v["factory_code"]) and $v["color_id"] and $v["standard_id"]) {
                $data[$k]["factory_code_all"] = makeFactoryCode($v, $v["factory_code"]);
            }
            
            $ids[] = $v[$this->workflowMainRowField];
            
        }
//        echo $this->workflowMainRowField;exit;
//        print_r($ids);exit;
        /**
         * 工作流
         */
        if($this->workflowAlias) {
            import("@.Workflow.Workflow");
            $workflow = new Workflow($this->workflowAlias);
            $processData = $workflow->getListProcess($ids);
//            print_r($processData);exit;
            foreach($data as $k=> $v) {
                $data[$k]["processes"] = $processData[$v[$this->workflowMainRowField]];
            }
//            print_r($data);exit;
        }
        return $data;
    }
    
    /**
     * @override
     */
    public function find($options = array()) {
        $data = parent::find($options);
        if(!$data) {
            return $data;
        }
        if($data["dateline"]) {
            $data["dateline_lang"] = date("Y-m-d H:i:s", $data["dateline"]);
        }
        if(isset($data["status"])) {
            if(isset($this->status_lang)) {
                $data["status_lang"] = L($this->status_lang[$data["status"]]);
            }
            if($this->status_class) {
                $data["status_class"] = $this->status_class[$data["status"]];
            }
        }
        if(isset($data["factory_code"]) and $data["color_id"] and $data["standard_id"]) {
            $data["factory_code_all"] = makeFactoryCode($data, $data["factory_code"]);
        }
        
        /**
         * 工作流
         */
        if($this->workflowAlias) {
            import("@.Workflow.Workflow");
            $workflow = new Workflow($this->workflowAlias);
            $processData = $workflow->getCurrentProcess($data[$this->workflowMainRowField]);
            $data["processes"] = $processData;
        }
        
        return $data;
    }
    
    /**
     * 执行删除
     */
    public function doDelete($ids, $pk, $modelName = null) {
        if(!$modelName) {
            $model = $this;
        } else {
            $model = D($modelName);
        }
        
        $pk = $pk ? $pk : $model->getPk();
        
        $condition = array(
            $pk => array("IN", is_array($ids) ? implode(",", $ids) : $ids)
        );
        
        if(in_array("deleted", $model->fields)) {
            $rs = $model->where($condition)->save(array("deleted"=>1));
        } else {
//                    echo 222;exit;
            $rs = $model->where($condition)->delete();
        }
        
        return $rs;
        
    }
    
}

?>
<?php
header('Content-Type: application/json');
header('Cache-Control: no-cache');

$servername = "sql306.iceiy.com";
$username = "icei_34736795";
$password = "Elena0721";
$dbname = "icei_34736795_aoora";

$RELATION_QUERY = "SELECT E1.id AS parentid, E1.item AS parent, E2.id AS childid, E2.item AS child FROM $dbname.relationship AS R LEFT JOIN $dbname.nameTable E1 ON R.parentId = E1.id LEFT JOIN $dbname.nameTable E2 ON R.childId = E2.id ORDER BY R.parentId, R.sortId, R.childId;";

class AOORADatabase{
    function __construct($servername, $username, $password, $dbname){
        $this->conn = mysqli_connect($servername, $username, $password, $dbname);
        mysqli_set_charset($this->conn, "utf8");
    }

    function showProblem(){
        if (!$this->conn) {
            echo mysqli_connect_error();
        }
    }

    function fetch($sql_statement){
        $dbgraph = array();
        $previous_parent_id = 1;
        $previous_parent = array(1, array());
        $query = mysqli_query($this->conn, $sql_statement);
        while ($row = mysqli_fetch_assoc($query)){
            $current_parent_id = intval($row["parentid"]);
            if ($previous_parent_id != $current_parent_id){
                array_push($dbgraph, $previous_parent);
                $previous_parent_id = $current_parent_id;
                $previous_parent = array($previous_parent_id, array());
            }
            array_push($previous_parent[1], array(intval($row["childid"]), $row["child"]));
        }
        array_push($dbgraph, $previous_parent);
        return $dbgraph;
    }

    function close(){
        mysqli_close($this->conn);
    }
}

$AOORADB = new AOORADatabase($servername, $username, $password, $dbname);
$AOORADB->showProblem();
$data = $AOORADB->fetch($RELATION_QUERY);
$AOORADB->close();
$JSON_data = json_encode($data);

echo $JSON_data;
?>
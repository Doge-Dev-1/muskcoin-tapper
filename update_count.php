<?php
// update_count.php
if (isset($_POST['puppy_Count'])) {
    $puppyCount = intval($_POST['puppy_Count']);

    // Database connection (replace with your actual database details)
    $servername = "localhost";
    $username = "nasirsyn_botuser";
    $password = "Alaminmasani@01";
    $dbname = "nasirsyn_botdb";

    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // Update the count in the database (replace with your actual table and column names)
    $sql = "UPDATE your_table SET count_column = $puppyCount WHERE your_condition";

    if ($conn->query($sql) === TRUE) {
        echo "Count updated successfully";
    } else {
        echo "Error updating count: " . $conn->error;
    }

    $conn->close();
}
?>
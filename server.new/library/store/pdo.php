<?php

class PDO_Store extends Store {
  
  protected $conn;
  protected $activeTransaction = false;
  
  function __construct($config) {
    $this->config = $config;
    $dsn = $this->get('dsn');
    $username = empty($config['username']) ? null : $config['username'];
    $password = empty($config['password']) ? null : $config['password'];
    try {
      $this->conn = new PDO($dsn, $username, $password);
    } catch (PDOException $e) {
      throw new Exception('PDO connection failed: ' . $e->getMessage());
    }
    $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  }
  
  
  function load($options) {
    
    $defaults = array(
      'key' => 'id',
      'sql' => 'SELECT * FROM {table} WHERE {key} = :value'
    );
    
    $regex = '/^(\w+)\((.+)\)$/';
    if (is_scalar($options) && preg_match($regex, $options, $matches)) {
      $options = array(
        'table' => $matches[1],
        'value' => $matches[2]
      );
    }
    
    if (empty($options['table'])) {
      return false;
    }
    
    if (isset($this->config["{$options['table']}_class"])) {
      $defaults['class'] = $this->config["{$options['table']}_class"];
    }
    $options = array_merge($defaults, $options);
    
    $sql = $this->substitute($options['sql'], $options);
    $values = array();
    
    if (preg_match_all('/:(\w+)/', $sql, $matches)) {
      foreach ($matches[1] as $key) {
        if (isset($options[$key])) {
          $values[$key] = $options[$key];
        }
      }
    }
    
    if (isset($options['class']) && class_exists($options['class'])) {
      $options['values'] = $this->row($sql, $values, PDO::FETCH_ASSOC);
      return Object::factory($options);
    } else {
      return $this->row($sql, $values);
    }
    
  }
  
  
  function save($object) {
    
  }
  
  
  /*
    Method: query
    Prepares and executes a SQL query
    
    Arguments:
      $sql  - A SQL query to execute [string].
      $vars - (optional) Variables used for substitution in a prepared SQL
              statement [array].
    
    Returns:
      A PDOStatement object resulting from the query.
  */
  public function query($sql, $vars = null) {
    $query = $this->prepare($sql);
    try {
      $query->execute($vars);
    } catch (PDOException $e) {
      if ($this->activeTransaction) {
        $this->rollBack();
      }
      throw new Exception($e->getMessage());
    }
    $insertId = $this->conn->lastInsertId();
    if (empty($this->lastInsertId) ||
        $insertId != $this->lastInsertId) {
      $this->lastInsertId = $insertId;
      $query->insertId = $insertId;
    }
    return $query;
  }
  
  
  /*
    Method: prepare
    Prepares a SQL query
    
    Arguments:
      $sql  - A SQL query to prepare [string].
    
    Returns:
      A PDOStatement object prepared for the query.
  */
  public function prepare($sql) {
    if (empty($this->conn)) {
      throw new Exception("No RelationalDB connection available.");
    }
    return $this->conn->prepare($sql);
  }
  
  
  /*
    Method: rows
    Executes a query and returns the results
    
    Arguments:
      $sql   - A SQL query to execute [string]
      $vars  - (optional) Variables used for substitution in a prepared SQL
               statement [array].
      $style - (optional) Specifies how the results should be encoded. See the
               documentation for PDOStatement_fetch for more details [integer].
    
    Returns:
      An array of results (anonymous objects by default).
  */
  function rows($sql, $vars = null, $style = PDO::FETCH_OBJ) {
    $query = $this->query($sql, $vars);
    return $query->fetchAll($style);
  }
  
  
  /*
    Method: row
    Executes a query and returns the first row from the results
    
    Arguments:
      $sql   - A SQL query to execute [string]
      $vars  - (optional) Variables used for substitution in a prepared SQL
               statement [array].
      $style - (optional) Specifies how the results should be encoded. See the
               documentation for PDOStatement_fetch for more details [integer].
    
    Returns:
      A single row result from the query. Encoded as an anonymous object by
      default, but varies according to the $style parameter.
  */
  public function row($sql, $vars = null, $style = PDO::FETCH_OBJ) {
    $query = $this->query($sql, $vars);
    return $query->fetch($style);
  }
  
  
  /*
    Method: value
    Executes a query and returns the first column from the first row of the
    results
    
    Arguments:
      $sql   - A SQL query to execute [string]
      $vars  - (optional) Variables used for substitution in a prepared SQL
               statement [array].
      
    Returns:
      A single value from the query [string].
  */
  public function value($sql, $vars = null) {
    $query = $this->query($sql, $vars);
    $row = $query->fetch(PDO::FETCH_NUM);
    if (count($row) < 1) {
      return null;
    }
    return $row[0];
  }
  
  
  /*
    Method: assoc
    Executes a query and returns an associative array from the first and second
    columns from the results
    
    Arguments:
      $sql  - A SQL query to execute [string]
      $vars - (optional) Variables used for substitution in a prepared SQL
               statement [array].
    
    Returns:
      An associative array of results from the query [array].
  */
  public function assoc($sql, $vars = null) {
    $query = $this->query($sql, $vars);
    $assoc = array();
    while ($row = $query->fetch(PDO::FETCH_NUM)) {
      if (count($row) < 2) {
        return null;
      }
      $assoc[$row[0]] = $row[1];
    }
    return $assoc;
  }
  
  
  /*
    Method: column
    Executes a query and returns the first column from the results
    
    Arguments:
      $sql  - A SQL query to execute [string]
      $vars - (optional) Variables used for substitution in a prepared SQL
               statement [array].
    
    Returns:
      A column of results from the query [array].
  */
  public function column($sql, $vars = null) {
    $query = $this->query($sql, $vars);
    return $query->fetchAll(PDO::FETCH_COLUMN);
  }
  
  
  /*
    Method: escape
    Escapes a string to defend against SQL injection
    
    Arguments:
      $value - A value or an array of values to escape [string or array].
    
    Returns
      An escaped version of the string [string].
  */
  function escape($value) {
    if (is_array($value)) {
      $escaped = array();
      foreach ($value as $key => $val) {
        $escaped[$key] = $this->escape($val);
      }
      return $escaped;
    } else if (is_scalar($value)) {
      return substr($this->conn->quote($value), 1, -1);
    } else {
      return null;
    }
  }
  
  
  /*
    Method: beginTransation
    Delays subsequent queries until executed with <commit>
    
    Arguments:
      None.
    
    Returns:
      Nothing.
    
    See also:
      <commit>, <rollback>
  */
  function beginTransaction() {
    $this->conn->beginTransaction();
    $this->activeTransaction = true;
  }
  
  
  /*
    Method: commit
    Commits pending queries from the current transaction
    
    Arguments:
      None.
    
    Returns:
      Nothing.
      
    See also:
      <beginTransaction>, <rollback>
  */
  function commit() {
    $this->conn->commit();
    $this->activeTransaction = false;
  }
  
  
  /*
    Method: rollBack
    Cancels pending queries and ends the current transaction
    
    Arguments:
      None.
    
    Returns:
      Nothing.
      
    See also:
      <beginTransaction>, <commit>
  */
  public function rollBack() {
    $this->conn->rollBack();
    $this->activeTransaction = false;
  }
  
  
  protected function getSequence() {
    $variations = array(
      'mysql' => 'BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT',
      'pgsql' => 'SERIAL NOT NULL',
      'sqlite' => 'INTEGER PRIMARY KEY AUTOINCREMENT'
    );
    $driver = $this->config['driver'];
    if (!empty($variations[$driver])) {
      return $variations[$driver];
    } else {
      return false;
    }
  }
  
  
  // Takes an associative array of configuration options and returns a PDO DSN.
  protected function getDSN() {
    if (is_array($this->config)) {
      extract($this->config);
    } else if (is_string($this->config)) {
      return $this->config;
    } else {
      throw new Exception('PDO: Invalid configuration.');
    }
    
    if (empty($driver)) {
      throw new Exception("PDO: No database driver specified.");
    }
    
    $dsn = "$driver:";
    switch ($driver) {
      case 'mysql':
        $vars = array('host', 'dbname', 'port', 'unix_socket');
        $separator = ';';
        break;
      case 'pgsql':
        $vars = array('host', 'user', 'password', 'dbname', 'port');
        $separator = ' ';
        break;
      case 'sqlite':
      case 'sqlite2':
        $vars = array();
        $separator = '';
        if (!empty($memory)) {
          $dsn .= ":memory:";
        } else {
          $dsn .= BASE_DIR . "/$path";
        }
        break;
      default:
        throw new Exception("PDO: Unknown database driver '$driver'.");
        break;
    }
    
    $options = array();
    foreach ($vars as $var) {
      if (!empty($$var)) {
        $options[] = "$var={$$var}";
      }
    }
    $dsn .= implode($separator, $options);
    return $dsn;
  }
  
}

?>
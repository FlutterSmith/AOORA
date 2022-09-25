import mysql.connector

KB_CONVERSION_TABLE = {
    "ct": ["create_item", [str]],
    "cl": ["create_relation", [int]],
    "dt": ["delete_item", [int]],
    "dl": ["delete_relation", [int]],
    "ut": ["update_item", [int, str]],
    "ul": ["update_relation", [int, int]],
    "st": ["sort", [int, int]],
    "ls": ["print_list", []],
    "ds": ["descend", [int]],
    "as": ["ascend", []],
    "d": ["descend", [int]],
    "a": ["ascend", []]
}

class SQLStatementProvider:
    def __init__(self, db_name):
        self.db_name = db_name

    def create_item(self, item: str) -> str:
        return f'INSERT INTO {self.db_name}.nametable (item) VALUES ("{item}");'

    def create_relation(self, parentid: int, childid: int, sortid: int = 1) -> str:
        return f'INSERT INTO {self.db_name}.relationship (parentid, childid, sortid) VALUES ({parentid}, {childid}, {sortid});'

    def delete_item(self, id: int) -> str:
        return f'DELETE FROM {self.db_name}.nametable WHERE id = {id};'

    def delete_relation(self, parentid: int, childid: int) -> str:
        return f'DELETE FROM {self.db_name}.relationship WHERE parentid = {parentid} AND childid = {childid};'

    def update_item(self, id: int, item: str) -> str:
        return f'UPDATE {self.db_name}.nametable SET item = "{item}" WHERE id = {id};'

    def update_relation(self, parentid: int, childid: int, new_parentid: int) -> str:
        return f'UPDATE {self.db_name}.relationship SET parentid = {new_parentid} WHERE parentid = {parentid} AND childid = {childid};'

    def sort(self, parentid: int, childid: int, new_sortid: int) -> str:
        return f'UPDATE {self.db_name}.relationship SET sortid = {new_sortid} WHERE parentid = {parentid} AND childid = {childid};'

    def list_items(self, parentid: int) -> str:
        return f'SELECT E2.id AS childid, E2.item AS child, R.sortid FROM tempdb.relationship R LEFT JOIN tempdb.nameTable E1 ON R.parentId = E1.id LEFT JOIN tempdb.nameTable E2 ON R.childId = E2.id WHERE R.parentId = {parentid} ORDER BY R.parentId, R.sortId, R.childId;'

class Database:
    def __init__(self):
        self.db = mysql.connector.connect(
            host = "localhost",
            user = "root",
            password = "mysql",
            database = "tempdb"
        )
        self.cursor = self.db.cursor()

    def get_last_insert_id(self):
        self.cursor.execute("SELECT LAST_INSERT_ID();")
        return self.cursor.fetchall()[0][0]

    def run(self, sql_statement: str):
        data = None
        lastid = 0
        try:
            self.cursor.execute(sql_statement)
            data = self.cursor.fetchall()
            lastid = self.get_last_insert_id()
            self.db.commit()
        except:
            self.db.rollback()
        return {"data": data, "lastid": lastid}

    def close(self):
        self.cursor.close()
        self.db.close()

class KnowledgeDatabase:
    def __init__(self):
        self.db = Database()
        self.sqlprovider = SQLStatementProvider("tempdb")
        self.path = [[1, self.get_root_name()]]

    def get_root_name(self) -> str:
        return self.db.run("SELECT * FROM tempdb.nametable WHERE id = 1")["data"][0][1]

    def get_position(self) -> int:
        return self.path[-1][0]

    def name_of(self, childid: int) -> str:
        return self.db.run(f'SELECT item FROM tempdb.nametable WHERE id = {childid}')["data"][0][0]

    def list_items(self) -> list:
        return self.db.run(self.sqlprovider.list_items(self.get_position()))["data"]

    def print_list(self):
        print(self.list_items())

    def parent_has_id(self, childid: int) -> bool:
        for child in self.list_items():
            if child[0] == childid:
                return True
        return False

    def ascend(self) -> None:
        if len(self.path) > 1:
            self.path.pop()

    def descend(self, childid: int) -> None:
        if self.parent_has_id(childid):
            self.path.append([childid, self.name_of(childid)])
        else:
            print(f"Problem: Cannot find your desired childid ({childid})")

    def create_item(self, item: str, sortid: int = 1) -> None:
        result = self.db.run(self.sqlprovider.create_item(item))
        self.db.run(self.sqlprovider.create_relation(self.get_position(), result["lastid"], sortid))

    def create_relation(self, childid: int, sortid: int = 1) -> None:
        self.db.run(self.sqlprovider.create_relation(self.get_position(), childid, sortid))

    def delete_item(self, childid: int) -> None:
        if childid == 1:
            print("Problem: Strict forbidden for deleting root node")
            return
        if self.db.run(f'SELECT COUNT(childid) FROM tempdb.relationship WHERE childid = {childid} OR parentid = {childid};')["data"][0][0] != 1:
            print(f"Problem: Cannot delete your desired childid ({childid}), for having multiple relations")
            return
        if not self.parent_has_id(childid):
            print(f"Problem: Cannot delete your desired childid ({childid}), for there aren't any descendant")
            return
        self.db.run(self.sqlprovider.delete_item(childid))
        self.db.run(self.sqlprovider.delete_relation(self.get_position(), childid))
        print(f"Success: Successfully deleted childid ({childid})")

    def delete_relation(self, childid: int) -> None:
        if self.db.run(f'SELECT COUNT(childid) FROM tempdb.relationship WHERE childid = {childid};')["data"][0][0] == 1:
            print(f"Problem: Cannot delete your desired relation ({childid}), for having only one relation")
            return
        if not self.parent_has_id(childid):
            print(f"Problem: Cannot delete your desired relation ({childid}), for there aren't any descendant")
            return
        self.db.run(self.sqlprovider.delete_relation(self.get_position(), childid))
        print(f"Success: Successfully deleted relation ({childid})")

    def update_item(self, childid: int, item: str) -> None:
        if not self.parent_has_id(childid):
            print(f"Problem: Cannot update your desired item ({childid}), for there aren't any descendant")
            return
        self.db.run(self.sqlprovider.update_item(childid, item))
        print(f"Success: Successfully updated item ({childid})")

    def update_relation(self, childid: int, new_parentid: str) -> None:
        if not self.parent_has_id(childid):
            print(f"Problem: Cannot update your desired relation ({childid}), for there aren't any descendant")
            return
        self.db.run(self.sqlprovider.update_relation(self.get_position(), childid, new_parentid))
        print(f"Success: Successfully updated relation ({childid})")

    def sort(self, childid: int, new_sortid: int) -> None:
        if not self.parent_has_id(childid):
            print(f"Problem: Cannot sort your desired item ({childid}), for there aren't any descendant")
            return
        self.db.run(self.sqlprovider.sort(self.get_position(), childid, new_sortid))
        print(f"Success: Successfully sorted item ({childid})")

    def run(self, command: str):
        command_arr = command.split(" ")
        command_name = command_arr[0]
        command_param = command_arr[1:]
        if not command_name in KB_CONVERSION_TABLE.keys():
            print("Problem: Invalid command")
            return
        method, required_types = KB_CONVERSION_TABLE[command_name]
        param_length = len(required_types)
        new_param = []
        for i in range(param_length):
            current_param = command_param[i]
            param_type = required_types[i]
            if i == param_length - 1:
                current_param = " ".join(command_param[i:])
            try:
                new_param.append(param_type(current_param))
            except:
                print("Problem: Invalid parameter type")
                return
        getattr(self, method)(*new_param)

    def close(self) -> None:
        self.db.close()

k = KnowledgeDatabase()
print("PATH", k.path)
#print(k.list_items())

running = True
while running:
    command = input(str(k.path))
    if command == "exit":
        running = False
    else:
        k.run(command)

'''
k.descend(2)
print("PATH", k.path)
print(k.list_items())
k.ascend()
print("PATH", k.path)
print(k.list_items())
'''
k.close()
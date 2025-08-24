"""
Simple test for import_data.py functionality
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Test the import functions
def test_import_functions():
    try:
        # Add the python directory to sys.path
        current_dir = os.path.dirname(os.path.abspath(__file__))
        python_dir = os.path.dirname(current_dir)
        sys.path.insert(0, python_dir)
        
        # Import the specific module
        from functions.import_data import _load_json_file, _get_data_path
        
        print("🧪 TESTING IMPORT DATA FUNCTIONS:")
        print()
        
        # Test data path
        data_path = _get_data_path()
        print(f"📁 Data path: {data_path}")
        print(f"📁 Exists: {os.path.exists(data_path)}")
        
        if os.path.exists(data_path):
            files = os.listdir(data_path)
            print(f"📄 Files found: {files}")
            
            # Test loading each JSON file
            json_files = [f for f in files if f.endswith('.json')]
            for json_file in json_files:
                try:
                    data = _load_json_file(json_file)
                    print(f"✅ {json_file}: {len(data)} items loaded")
                except Exception as e:
                    print(f"❌ {json_file}: Error - {e}")
        
        print()
        print("🏆 IMPORT FUNCTIONS TEST COMPLETE!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    test_import_functions()

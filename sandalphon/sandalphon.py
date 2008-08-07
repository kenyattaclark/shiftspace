import os
import sys
import re
import xml.etree.ElementTree as ElementTree
from elementtidy import TidyHTMLTreeBuilder

class ViewParser:
    def __init__(self, element):
        print "Init ViewParser"
        self.element = element;


class SSTableViewParser(ViewParser):
    def __init__(self, element):
        print "Init SSTableViewParser"
        ViewParser.__init__(self, element)
        pass


class SSCustomTableRowParser(ViewParser):
    def __init__(self, element):
        print "Init SSCustomTableRowParser"
        ViewParser.__init__(self, element)


def elementHasAttribute(element, attrib, value=None):
    """
    Check if an element has an attribute and matches a value
    """
    return ((value != None) and (element.get(attrib) == value)) or (element.get(attrib) != None)


class SandalphonCompiler:

    def __init__(self):
        self.paths = {}
        # regex for template pattern /<\?.+?\?>/g
        self.templatePattern = re.compile('<\?.+?\?>')
        self.getPaths()


    def getPaths(self):
        """
        Looks into views and builds the paths to the interface files
        """
        viewsDirectory = "../client/views/"
        customViewsDirectory = "../client/customViews/"
        # grab the base view classes and filter out .svn files
        views = [f for f in os.listdir(viewsDirectory) if(f != ".svn")]
        # grab the custom views and filter out the .svn files
        customViews = [f for f in os.listdir(customViewsDirectory) if (f != ".svn")]

        self.paths = {}

        for f in views:
            self.paths[os.path.splitext(f)[0]] = os.path.join(viewsDirectory, f)

        for f in customViews:
            self.paths[os.path.splitext(f)[0]] = os.path.join(customViewsDirectory, f)

        print self.paths
        

    def validateMarkup(self, markup):
        """
        Make sure the passed in markup checks out.
        """
        try:
            element = ElementTree.fromstring(markup)
        except xml.parsers.expat.ExpatError:
            raise xml.parsers.expath.ExpatError
        pass


    def parserForView(self, view):
        """
        Return the view parser class object associated with the view element.
        """
        theClass = view.get("uiclass") + "Parser"
        print "getParserForView: " + theClass
        module = sys.modules[ViewParser.__module__]
        if(hasattr(module, theClass)):
            return getattr(module, theClass)
        else:
            return None


    def loadView(self, view):
        """
        Load a views a view and returns it.
        """
        print ("loadView: " + view)
        filePath = self.paths[view]
        print filePath
        if filePath != None:
            fileHandle = open(filePath)
            # verify that this file is valid mark up
            fileContents = fileHandle.read()
            fileHandle.close()
            return fileContents
        else:
            return None
        

    def getInstruction(self, str):
        """
        Takes a raw template instruction and returns a tuple holding the instruction name and it's parameter.
        """
        temp = str[2:len(str)-2]
        temp = temp.split(':')
        return (temp[0], temp[1])

    
    def handleInstruction(self, instruction, file):
        """
        Takes an instruction tuple and the contents of the file as a string. Returns the file post instruction.
        """
        if instruction[0] == "customView":
            # load this view, will need match that view as well
            theView = self.loadView(instruction[1])
            print theView
            # replace the match
            return self.templatePattern.sub(theView, file, 1)

        return file
    

    def compile(self, path):
        """
        Compile an interface file down to its parts
        """
        # First regex any dependent files into a master view
        # Parse the file at the path
        fileHandle = open(path)
        interfaceFile = fileHandle.read()
        fileHandle.close()
        
        matches = self.templatePattern.finditer(interfaceFile)
        
        hasCustomViews = True
        while hasCustomViews:
            match = self.templatePattern.search(interfaceFile)
            if match:
                # get the span of the match in the file
                span = match.span()
                # grab the instruction
                instruction = self.getInstruction(interfaceFile[span[0]:span[1]])
                # mutate the file based on it
                interfaceFile = self.handleInstruction(instruction, interfaceFile)
            else:
                hasCustomViews = False
                
        interfaceFile = ElementTree.fromstring(interfaceFile)
 
        # get the actual file name
        compiledViewsDirectory = "../client/compiledViews/"
        fileName = os.path.basename(path)
        fullPath = os.path.join(compiledViewsDirectory, fileName)

        print "Writing compiled view file"
        fileHandle = open(fullPath, "w")
        # write the compiled file
        fileHandle.write(ElementTree.tostring(interfaceFile))
        # close the file
        fileHandle.close()

        print "Pretty printing"
        # make it pretty
        exitcode = os.system('tidy -i -xml -m %s' % (fullPath))
        print exitcode
        
        """
        # Grab the root element
        root = interfaceFile.getroot()
        # Check if it has a backing uiclass
        print "Root has uiclass %s" % elementHasAttribute(root, "uiclass")
        # Grab all the other uiclasses
        uiclasses = [el for el in interfaceFile.findall("//*") if elementHasAttribute(el, "uiclass")]
        print uiclasses
        # Instantiate each one with it's proper class
        [self.parserForView(el)(el) for el in uiclasses]
        """


if __name__ == "__main__":
    print ("sandalphon.py compiling " + sys.argv[1])
    compiler = SandalphonCompiler()
    compiler.compile(sys.argv[1])

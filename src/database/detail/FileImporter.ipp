namespace Xeth{

template<class Store, class Validator>
FileImporter<Store, Validator>::FileImporter(Store &store) :
    _store(store)
{}


template<class Store, class Validator>
FileImporter<Store, Validator>::FileImporter(Store &store, const Validator &validator) :
    _store(store),
    _validator(validator)
{}


template<class Store, class Validator>
bool FileImporter<Store, Validator>::import(const std::string &path)
{
    Json::Value json;
    Data val;
    return import(path, json, val);
}

template<class Store, class Validator>
bool FileImporter<Store, Validator>::import(const std::string &path, Json::Value &result)
{
    Data value;
    return import(path, result, value);
}

template<class Store, class Validator>
bool FileImporter<Store, Validator>::import(const std::string &path, Data &result)
{
    Json::Value json;
    return import(path, json, result);
}


template<class Store, class Validator>
bool FileImporter<Store, Validator>::import(const std::string &path, Json::Value &json, Data &value)
{
    JsonReader reader;

    std::string absolutePath = boost::filesystem::absolute(path).string();
    if(!reader.read(absolutePath.c_str(), json))
    {
        return false;
    }

    //validate content
    try
    {
        DataSerializer serializer;
        value = serializer.unserialize(json);
        if(!_validator(value))
        {
            return false;
        }
        KeyAttributesReader<Store> attrs(path, json);
        
        return _store.replace(value, attrs.getCreationTime());
    }
    catch(...)
    {}
    return false;
}



template<class Item>
bool NullValidator::operator()(const Item &) const
{
    return true;
}






}

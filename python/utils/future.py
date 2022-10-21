async def async_result(f):
    await f
    return f.result()